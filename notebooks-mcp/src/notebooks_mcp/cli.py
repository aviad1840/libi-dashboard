#!/usr/bin/env python3
"""
notebooks-mcp CLI
=================
Global tool — install once, activate in any project.

Usage:
  notebooks-mcp init               # add .claude/settings.json + operating layer to current project
  notebooks-mcp add NAME PATH      # register a notebook folder
  notebooks-mcp list               # list configured notebooks
  notebooks-mcp login              # authenticate with Google NotebookLM
  notebooks-mcp setup              # full first-time setup
  notebooks-mcp desktop            # connect to Claude Desktop App
"""
import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

# Path to bundled templates inside the installed package
_TEMPLATES_DIR = Path(__file__).parent / "templates"
_OPERATING_LAYER_SRC = _TEMPLATES_DIR / "OPERATING_LAYER.md"


# ── Config paths ──────────────────────────────────────────────────────────

NOTEBOOKS_JSON = Path.home() / ".claude" / "notebooks.json"

CLAUDE_DESKTOP_CONFIG = {
    "Darwin":  Path.home() / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json",
    "Windows": Path(os.environ.get("APPDATA", "~")) / "Claude" / "claude_desktop_config.json",
    "Linux":   Path.home() / ".config" / "Claude" / "claude_desktop_config.json",
}.get(platform.system(), Path.home() / ".config" / "Claude" / "claude_desktop_config.json")


# ── Helpers ───────────────────────────────────────────────────────────────

def _python() -> str:
    return sys.executable


def _mcp_servers_block() -> dict:
    """Return the mcpServers dict using the installed package."""
    return {
        "notebooks": {
            "command": _python(),
            "args": ["-m", "notebooks_mcp.local_server"],
        },
        "google-notebooklm": {
            "command": _python(),
            "args": ["-m", "notebooks_mcp.google_server"],
        },
    }


def _load_json(path: Path) -> dict:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            print(f"  ⚠️  Could not parse {path} — treating as empty.")
    return {}


def _save_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _merge_mcp_servers(config_path: Path) -> None:
    cfg = _load_json(config_path)
    cfg.setdefault("mcpServers", {}).update(_mcp_servers_block())
    _save_json(config_path, cfg)


# ── Commands ──────────────────────────────────────────────────────────────

def _install_global_operating_layer(force: bool = False) -> Path:
    """
    Write the operating layer into ~/.claude/CLAUDE.md (global, all projects).
    Claude Code reads this before any per-project CLAUDE.md.
    """
    global_claude_md = Path.home() / ".claude" / "CLAUDE.md"
    global_claude_md.parent.mkdir(parents=True, exist_ok=True)

    if not _OPERATING_LAYER_SRC.exists():
        print("  ⚠️  Template not found — skipping operating layer install.")
        return global_claude_md

    layer_content = _OPERATING_LAYER_SRC.read_text(encoding="utf-8")
    marker = "<!-- notebooks-mcp operating layer -->"

    if global_claude_md.exists() and not force:
        existing = global_claude_md.read_text(encoding="utf-8")
        if marker in existing:
            print(f"  ℹ️  Operating layer already in {global_claude_md} (use --force to overwrite)")
            return global_claude_md
        # Append to existing global CLAUDE.md
        global_claude_md.write_text(
            existing.rstrip() + f"\n\n{marker}\n\n{layer_content}",
            encoding="utf-8",
        )
    else:
        global_claude_md.write_text(
            f"{marker}\n\n{layer_content}",
            encoding="utf-8",
        )

    return global_claude_md


def cmd_init(args) -> None:
    """Activate notebooks-mcp in a project: writes .claude/settings.json only."""
    project = Path(args.path).resolve() if args.path else Path.cwd()
    settings = project / ".claude" / "settings.json"

    _merge_mcp_servers(settings)

    print(f"\n✅  notebooks-mcp activated for: {project.name}/")
    print(f"   {settings}")
    print()
    print("   Tools active in every Claude Code session here:")
    print("     notebook_*       — local folder notebooks")
    print("     notebooklm_*     — Google NotebookLM (18 tools)")
    print()
    print("   Operating layer: ~/.claude/CLAUDE.md (global — run 'setup' once)")
    print()


def cmd_add(args) -> None:
    """Register a notebook folder in ~/.claude/notebooks.json."""
    name = args.name.strip()
    path = Path(args.path).expanduser().resolve()
    desc = args.description or ""

    cfg = _load_json(NOTEBOOKS_JSON)
    cfg.setdefault("notebooks", {})[name] = {
        "path": str(path),
        "description": desc,
    }
    _save_json(NOTEBOOKS_JSON, cfg)

    exists = "✅" if path.exists() else "⚠️  path not found on disk"
    print(f"\n✅  Added notebook '{name}' → {path}  ({exists})")
    print(f"   Config: {NOTEBOOKS_JSON}")
    print()


def cmd_list(args) -> None:
    """List all configured notebooks."""
    cfg = _load_json(NOTEBOOKS_JSON)
    notebooks = cfg.get("notebooks", {})

    if not notebooks:
        print("\n  No notebooks configured yet.")
        print(f"  Add one:  notebooks-mcp add NAME /path/to/folder\n")
        return

    print(f"\n  Notebooks  ({NOTEBOOKS_JSON})\n")
    for name, nb in notebooks.items():
        path = nb.get("path", nb) if isinstance(nb, dict) else nb
        desc = nb.get("description", "") if isinstance(nb, dict) else ""
        exists = "✅" if Path(path).exists() else "❌"
        print(f"  {exists}  {name:<20} {path}")
        if desc:
            print(f"             {' ' * 20} {desc}")
    print()


def cmd_login(args) -> None:
    """Authenticate with Google NotebookLM."""
    if not shutil.which("notebooklm"):
        print("\n  notebooklm CLI not found.")
        print("  Install:  pip install \"notebooklm-py[playwright]\"")
        print("            playwright install chromium\n")
        sys.exit(1)
    subprocess.run(["notebooklm", "login"], check=False)


def cmd_setup(args) -> None:
    """Full first-time setup — run once, works for all future projects."""
    print("\n═══════════════════════════════════════")
    print("  notebooks-mcp — Setup")
    print("═══════════════════════════════════════\n")

    # 1. notebooklm-py + playwright
    print("▸ Installing notebooklm-py ...")
    subprocess.run(
        [_python(), "-m", "pip", "install", "--quiet", "notebooklm-py[playwright]"],
        check=False,
    )
    subprocess.run(["playwright", "install", "chromium", "--quiet"], check=False)
    print("  ✅ Done\n")

    # 2. notebooks.json
    if not NOTEBOOKS_JSON.exists():
        _save_json(NOTEBOOKS_JSON, {"notebooks": {}})
        print(f"  ✅ Created {NOTEBOOKS_JSON}")
    else:
        print(f"  ℹ️  {NOTEBOOKS_JSON} already exists")

    # 3. Global operating layer → ~/.claude/CLAUDE.md
    print("▸ Installing operating layer → ~/.claude/CLAUDE.md ...")
    dest = _install_global_operating_layer(force=getattr(args, "force", False))
    print(f"  ✅ {dest}\n")

    print("▸ Next:")
    print("  notebooks-mcp add NAME ~/path      # register folders")
    print("  notebooks-mcp login                # Google NotebookLM auth")
    print("  cd /any/project && notebooks-mcp init   # activate per-project MCP")
    print("  notebooks-mcp desktop              # Claude Desktop App (optional)")
    print()


def cmd_desktop(args) -> None:
    """Connect MCP servers to Claude Desktop App."""
    _merge_mcp_servers(CLAUDE_DESKTOP_CONFIG)

    print(f"\n✅  Claude Desktop App connected!")
    print(f"   Config: {CLAUDE_DESKTOP_CONFIG}")
    print()
    print("   → Restart Claude Desktop App to apply changes.")
    print()


def cmd_remove(args) -> None:
    """Remove a notebook from ~/.claude/notebooks.json."""
    cfg = _load_json(NOTEBOOKS_JSON)
    notebooks = cfg.get("notebooks", {})
    if args.name not in notebooks:
        print(f"\n  Notebook '{args.name}' not found.\n")
        cmd_list(args)
        return
    del notebooks[args.name]
    _save_json(NOTEBOOKS_JSON, cfg)
    print(f"\n  Removed notebook '{args.name}'.\n")


# ── Entry point ───────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        prog="notebooks-mcp",
        description="MCP servers for Claude: local folders + Google NotebookLM",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  notebooks-mcp setup                         # first-time install\n"
            "  notebooks-mcp add research ~/docs/research  # register a folder\n"
            "  notebooks-mcp init                          # activate in current project\n"
            "  notebooks-mcp login                         # Google auth\n"
            "  notebooks-mcp desktop                       # Claude Desktop App\n"
        ),
    )

    sub = parser.add_subparsers(dest="command", metavar="COMMAND")
    sub.required = True

    # init
    p_init = sub.add_parser("init", help="Activate MCP in current project (.claude/settings.json)")
    p_init.add_argument("path", nargs="?", default=None, help="Project path (default: cwd)")
    p_init.set_defaults(func=cmd_init)

    # add
    p_add = sub.add_parser("add", help="Register a notebook folder")
    p_add.add_argument("name", help="Short name, e.g. 'research'")
    p_add.add_argument("path", help="Folder path")
    p_add.add_argument("-d", "--description", default="", help="Optional description")
    p_add.set_defaults(func=cmd_add)

    # remove
    p_rm = sub.add_parser("remove", help="Remove a notebook from config")
    p_rm.add_argument("name")
    p_rm.set_defaults(func=cmd_remove)

    # list
    p_list = sub.add_parser("list", help="List configured notebooks")
    p_list.set_defaults(func=cmd_list)

    # login
    p_login = sub.add_parser("login", help="Google NotebookLM auth (opens browser)")
    p_login.set_defaults(func=cmd_login)

    # setup
    p_setup = sub.add_parser("setup", help="First-time setup (run once)")
    p_setup.add_argument("--force", action="store_true", help="Overwrite existing operating layer")
    p_setup.set_defaults(func=cmd_setup)

    # desktop
    p_desktop = sub.add_parser("desktop", help="Connect to Claude Desktop App")
    p_desktop.set_defaults(func=cmd_desktop)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
