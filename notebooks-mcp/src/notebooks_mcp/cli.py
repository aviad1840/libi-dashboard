#!/usr/bin/env python3
"""
notebooks-mcp CLI
=================
Global tool — install once, activate in any project.

Usage:
  notebooks-mcp init               # add .claude/settings.json to current project
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

def cmd_init(args) -> None:
    """Add .claude/settings.json to the current project directory."""
    project = Path(args.path).resolve() if args.path else Path.cwd()
    settings = project / ".claude" / "settings.json"

    _merge_mcp_servers(settings)

    print(f"\n✅  notebooks-mcp activated for: {project.name}/")
    print(f"   Config: {settings}")
    print()
    print("   Tools available in every Claude Code session here:")
    print("     • notebook_*        — local folder notebooks")
    print("     • notebooklm_*      — Google NotebookLM (18 tools)")
    print()
    print("   If not yet authenticated:")
    print("     notebooks-mcp login")
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
    """Full first-time setup."""
    print("\n═══════════════════════════════════════")
    print("  notebooks-mcp — First-time setup")
    print("═══════════════════════════════════════\n")

    # 1. notebooklm-py
    print("▸ Installing notebooklm-py + playwright ...")
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

    print()
    print("▸ Next steps:")
    print("  1. Add notebook folders:")
    print("       notebooks-mcp add NAME /path/to/folder")
    print()
    print("  2. Activate in any project:")
    print("       cd /your/project && notebooks-mcp init")
    print()
    print("  3. Connect Google NotebookLM (opens browser):")
    print("       notebooks-mcp login")
    print()
    print("  4. Connect Claude Desktop App (optional):")
    print("       notebooks-mcp desktop")
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
    p_init = sub.add_parser("init", help="Activate in current project (creates .claude/settings.json)")
    p_init.add_argument("path", nargs="?", default=None, help="Project path (default: current directory)")
    p_init.set_defaults(func=cmd_init)

    # add
    p_add = sub.add_parser("add", help="Register a notebook folder")
    p_add.add_argument("name", help="Short name, e.g. 'research'")
    p_add.add_argument("path", help="Absolute or relative folder path")
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
    p_login = sub.add_parser("login", help="Authenticate with Google NotebookLM")
    p_login.set_defaults(func=cmd_login)

    # setup
    p_setup = sub.add_parser("setup", help="Full first-time setup")
    p_setup.set_defaults(func=cmd_setup)

    # desktop
    p_desktop = sub.add_parser("desktop", help="Connect to Claude Desktop App")
    p_desktop.set_defaults(func=cmd_desktop)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
