#!/usr/bin/env python3
"""
Notebooks MCP Server
====================
Exposes local notebook folders as context tools for Claude Code.

Config (checked in order):
  ~/.claude/notebooks.json
  <this file's directory>/notebooks.json

Tools exposed to Claude:
  notebook_list    — list all configured notebooks
  notebook_context — load all files from a notebook as context
  notebook_search  — keyword search across notebook files
  notebook_add     — add/update a notebook in the config
"""
import asyncio
import json
from pathlib import Path
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

_HERE = Path(__file__).parent
CONFIG_PATHS = [
    Path.home() / ".claude" / "notebooks.json",
    _HERE / "notebooks.json",
]

TEXT_EXTENSIONS = {
    ".md", ".txt", ".mdx",
    ".py", ".ts", ".tsx", ".js", ".jsx",
    ".json", ".yaml", ".yml", ".toml",
    ".html", ".css", ".sh",
}
MAX_FILES_PER_NOTEBOOK = 80
MAX_FILE_BYTES = 100_000  # 100 KB per file cap


def load_config() -> dict:
    for p in CONFIG_PATHS:
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    return {"notebooks": {}}


def save_config(config: dict) -> Path:
    target = Path.home() / ".claude" / "notebooks.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
    return target


def resolve_notebook(name: str) -> tuple[str, Path] | None:
    """Return (description, path) or None if not found."""
    nb = load_config().get("notebooks", {}).get(name)
    if nb is None:
        return None
    if isinstance(nb, dict):
        return nb.get("description", ""), Path(nb["path"])
    return "", Path(nb)


# ---------------------------------------------------------------------------
# File reading helpers
# ---------------------------------------------------------------------------

def iter_text_files(root: Path, extensions: set[str] | None = None):
    exts = extensions or TEXT_EXTENSIONS
    for f in sorted(root.rglob("*")):
        if (
            f.is_file()
            and f.suffix.lower() in exts
            and not any(part.startswith(".") for part in f.parts[-3:])  # skip hidden dirs
            and "node_modules" not in f.parts
            and "__pycache__" not in f.parts
        ):
            yield f


def read_notebook_files(root: Path, extensions: set[str] | None = None) -> str:
    if not root.exists():
        return f"[Error: path not found: {root}]"

    parts: list[str] = []
    count = 0
    skipped = 0

    for f in iter_text_files(root, extensions):
        if count >= MAX_FILES_PER_NOTEBOOK:
            skipped += 1
            continue
        rel = f.relative_to(root)
        try:
            raw = f.read_bytes()
            text = raw[:MAX_FILE_BYTES].decode("utf-8", errors="replace")
            truncated = len(raw) > MAX_FILE_BYTES
            note = " *(truncated)*" if truncated else ""
            parts.append(f"### {rel}{note}\n\n```\n{text}\n```")
            count += 1
        except Exception as e:
            parts.append(f"### {rel}\n\n[read error: {e}]")

    if not parts:
        return f"[No text files found in {root}]"

    header = f"**{count} files loaded from `{root}`**"
    if skipped:
        header += f" *(+{skipped} skipped — limit {MAX_FILES_PER_NOTEBOOK})*"

    return header + "\n\n---\n\n" + "\n\n---\n\n".join(parts)


# ---------------------------------------------------------------------------
# MCP Server
# ---------------------------------------------------------------------------

server = Server("notebooks-mcp")


@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="notebook_list",
            description="List all configured notebooks and their paths.",
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        types.Tool(
            name="notebook_context",
            description=(
                "Load all text files from a notebook folder and return their content as context. "
                "Use this when the user asks to 'load', 'open', or 'use' a notebook."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Notebook name as it appears in the config.",
                    },
                    "extensions": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": (
                            "Optional list of file extensions to include, e.g. [\".md\", \".txt\"]. "
                            "Defaults to all common text/code types."
                        ),
                    },
                },
                "required": ["name"],
            },
        ),
        types.Tool(
            name="notebook_search",
            description="Search for a keyword or phrase across all files in a notebook. Returns matching lines with context.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Notebook name."},
                    "query": {"type": "string", "description": "Search term (case-insensitive)."},
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of file matches to return (default 20).",
                    },
                },
                "required": ["name", "query"],
            },
        ),
        types.Tool(
            name="notebook_add",
            description="Add or update a notebook entry in ~/.claude/notebooks.json.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Short slug name for this notebook (e.g. 'libi', 'research').",
                    },
                    "path": {
                        "type": "string",
                        "description": "Absolute path to the folder.",
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional human-readable description.",
                    },
                },
                "required": ["name", "path"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    config = load_config()
    notebooks: dict = config.get("notebooks", {})

    # ── notebook_list ──────────────────────────────────────────────────────
    if name == "notebook_list":
        if not notebooks:
            return [types.TextContent(
                type="text",
                text=(
                    "No notebooks configured yet.\n\n"
                    "Add one with `notebook_add`, or create `~/.claude/notebooks.json`:\n\n"
                    "```json\n"
                    '{\n  "notebooks": {\n    "my-notes": {\n      "path": "/Users/you/notes",\n      "description": "My research notes"\n    }\n  }\n}\n'
                    "```"
                ),
            )]
        lines = ["**Configured notebooks:**\n"]
        for nb_name, nb in notebooks.items():
            path = nb.get("path", nb) if isinstance(nb, dict) else nb
            desc = nb.get("description", "") if isinstance(nb, dict) else ""
            exists = "✅" if Path(path).exists() else "❌ (path not found)"
            lines.append(f"- **{nb_name}** {exists}\n  `{path}`{f'  — {desc}' if desc else ''}")
        return [types.TextContent(type="text", text="\n".join(lines))]

    # ── notebook_context ───────────────────────────────────────────────────
    if name == "notebook_context":
        nb_name = arguments.get("name", "")
        if nb_name not in notebooks:
            available = list(notebooks.keys())
            return [types.TextContent(
                type="text",
                text=f"Notebook **'{nb_name}'** not found.\nAvailable: {available or ['(none — use notebook_add first)']}",
            )]
        result = resolve_notebook(nb_name)
        if result is None:
            return [types.TextContent(type="text", text=f"Notebook '{nb_name}' config is invalid.")]
        desc, root = result

        raw_exts = arguments.get("extensions")
        exts = set(raw_exts) if raw_exts else None
        content = read_notebook_files(root, exts)
        header = f"# Notebook: {nb_name}{f'  —  {desc}' if desc else ''}\n\n"
        return [types.TextContent(type="text", text=header + content)]

    # ── notebook_search ────────────────────────────────────────────────────
    if name == "notebook_search":
        nb_name = arguments.get("name", "")
        query = arguments.get("query", "").lower()
        max_results = int(arguments.get("max_results", 20))

        if nb_name not in notebooks:
            return [types.TextContent(type="text", text=f"Notebook '{nb_name}' not found.")]
        result = resolve_notebook(nb_name)
        if result is None:
            return [types.TextContent(type="text", text=f"Notebook '{nb_name}' config is invalid.")]
        _, root = result

        if not root.exists():
            return [types.TextContent(type="text", text=f"Path not found: {root}")]

        hits: list[str] = []
        for f in iter_text_files(root):
            if len(hits) >= max_results:
                break
            try:
                lines = f.read_text(encoding="utf-8", errors="replace").splitlines()
                matches = [
                    f"  L{i + 1}: {line.strip()}"
                    for i, line in enumerate(lines)
                    if query in line.lower()
                ]
                if matches:
                    rel = f.relative_to(root)
                    hits.append(f"**{rel}**\n" + "\n".join(matches[:8]))
            except Exception:
                pass

        if not hits:
            return [types.TextContent(type="text", text=f"No matches for **'{query}'** in notebook **'{nb_name}'**.")]
        summary = f"# Search: '{query}' in {nb_name}\n{len(hits)} file(s) matched\n\n"
        return [types.TextContent(type="text", text=summary + "\n\n".join(hits))]

    # ── notebook_add ───────────────────────────────────────────────────────
    if name == "notebook_add":
        nb_name = arguments.get("name", "").strip()
        path = arguments.get("path", "").strip()
        desc = arguments.get("description", "").strip()

        if not nb_name or not path:
            return [types.TextContent(type="text", text="Both 'name' and 'path' are required.")]

        resolved = Path(path).expanduser().resolve()
        current = load_config()
        current.setdefault("notebooks", {})[nb_name] = {
            "path": str(resolved),
            "description": desc,
        }
        saved = save_config(current)
        exists_note = "✅ path exists" if resolved.exists() else "⚠️  path not found on disk yet"
        return [types.TextContent(
            type="text",
            text=f"Saved notebook **'{nb_name}'** → `{resolved}`  ({exists_note})\nConfig file: `{saved}`",
        )]

    return [types.TextContent(type="text", text=f"Unknown tool: {name}")]


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main() -> None:
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())
