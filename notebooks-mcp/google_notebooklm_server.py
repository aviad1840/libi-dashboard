#!/usr/bin/env python3
"""
Google NotebookLM MCP Server
=============================
Wraps the `notebooklm` CLI (notebooklm-py) as MCP tools for Claude.

Install:
    pip install "notebooklm-py[playwright]"
    playwright install chromium

First login (once):
    notebooklm login

Then Claude can use all NotebookLM capabilities as tools.
"""
import asyncio
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types

server = Server("google-notebooklm")

# ---------------------------------------------------------------------------
# CLI runner
# ---------------------------------------------------------------------------

async def _run(
    *args: str,
    timeout: int = 30,
    json_output: bool = True,
) -> tuple[bool, str]:
    """
    Run `notebooklm <args>` and return (success, output_text).
    json_output=True appends --json automatically.
    """
    if not shutil.which("notebooklm"):
        return False, (
            "notebooklm CLI not found.\n\n"
            "Install it:\n"
            "  pip install \"notebooklm-py[playwright]\"\n"
            "  playwright install chromium\n\n"
            "Then authenticate:\n"
            "  notebooklm login"
        )

    cmd = ["notebooklm", *args]
    if json_output and "--json" not in args:
        cmd.append("--json")

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            proc.kill()
            return False, f"Command timed out after {timeout}s: {' '.join(cmd)}"

        out = stdout.decode("utf-8", errors="replace").strip()
        err = stderr.decode("utf-8", errors="replace").strip()

        if proc.returncode != 0:
            combined = f"Exit {proc.returncode}\n{out}\n{err}".strip()
            return False, combined

        return True, out or err

    except Exception as exc:
        return False, f"Failed to run notebooklm: {exc}"


def _fmt(success: bool, output: str) -> list[types.TextContent]:
    if not success:
        return [types.TextContent(type="text", text=f"**Error:**\n{output}")]
    return [types.TextContent(type="text", text=output)]


def _pretty_json(raw: str) -> str:
    """Try to pretty-print JSON, fall back to raw string."""
    try:
        return json.dumps(json.loads(raw), indent=2, ensure_ascii=False)
    except Exception:
        return raw


# ---------------------------------------------------------------------------
# Tool definitions
# ---------------------------------------------------------------------------

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [

        # ── Auth ─────────────────────────────────────────────────────────
        types.Tool(
            name="notebooklm_auth_check",
            description=(
                "Check if the user is authenticated with Google NotebookLM. "
                "Run this first before any other NotebookLM operation. "
                "If not authenticated, call notebooklm_login."
            ),
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        types.Tool(
            name="notebooklm_login",
            description=(
                "Open a browser window so the user can log in to Google NotebookLM. "
                "Must be run once on initial setup. After the user completes login, "
                "the session is saved locally and all other tools become available."
            ),
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),

        # ── Notebooks ────────────────────────────────────────────────────
        types.Tool(
            name="notebooklm_list",
            description=(
                "List all the user's Google NotebookLM notebooks with their IDs, "
                "titles, and source counts."
            ),
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        types.Tool(
            name="notebooklm_create",
            description="Create a new Google NotebookLM notebook with the given title.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Notebook title."},
                },
                "required": ["title"],
            },
        ),
        types.Tool(
            name="notebooklm_use",
            description=(
                "Set the active NotebookLM notebook context by ID. "
                "Subsequent operations that don't specify --notebook will use this one."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID from notebooklm_list."},
                },
                "required": ["notebook_id"],
            },
        ),
        types.Tool(
            name="notebooklm_status",
            description="Show the currently active notebook and its basic info.",
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        types.Tool(
            name="notebooklm_delete",
            description="Delete a NotebookLM notebook permanently. Requires explicit confirmation.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string"},
                    "confirmed": {
                        "type": "boolean",
                        "description": "Must be true — user must explicitly confirm deletion.",
                    },
                },
                "required": ["notebook_id", "confirmed"],
            },
        ),

        # ── Sources ──────────────────────────────────────────────────────
        types.Tool(
            name="notebooklm_source_add",
            description=(
                "Add a source to a NotebookLM notebook. "
                "Supported: web URLs, YouTube links, PDFs, Google Docs, "
                "Markdown files, plain text, Word docs, EPUB, audio/video files. "
                "Returns source_id for tracking processing."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "source": {
                        "type": "string",
                        "description": "URL, file path, or inline text content to add.",
                    },
                    "notebook_id": {
                        "type": "string",
                        "description": "Target notebook ID. Uses active context if omitted.",
                    },
                },
                "required": ["source"],
            },
        ),
        types.Tool(
            name="notebooklm_source_list",
            description="List all sources in a notebook with their IDs, titles, and processing status.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string", "description": "Notebook ID (optional)."},
                },
                "required": [],
            },
        ),
        types.Tool(
            name="notebooklm_source_wait",
            description=(
                "Wait until a source finishes processing (indexing) in NotebookLM. "
                "Call this after notebooklm_source_add before querying or generating."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "source_id": {"type": "string"},
                    "notebook_id": {"type": "string", "description": "Notebook ID (optional)."},
                    "timeout": {
                        "type": "integer",
                        "description": "Max seconds to wait (default 120).",
                    },
                },
                "required": ["source_id"],
            },
        ),
        types.Tool(
            name="notebooklm_source_fulltext",
            description=(
                "Retrieve the full indexed text of a source from NotebookLM. "
                "Use this to read heavy documents without burning local context tokens — "
                "NotebookLM has already indexed and stored the content."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "source_id": {"type": "string"},
                    "notebook_id": {"type": "string", "description": "Notebook ID (optional)."},
                },
                "required": ["source_id"],
            },
        ),
        types.Tool(
            name="notebooklm_source_research",
            description=(
                "Run a web research query — NotebookLM searches the web, "
                "finds relevant pages, and auto-imports them as sources. "
                "Good for building a research notebook on a topic quickly."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Research question or topic."},
                    "mode": {
                        "type": "string",
                        "enum": ["fast", "deep"],
                        "description": "fast = quick overview, deep = thorough research (default: fast).",
                    },
                    "notebook_id": {"type": "string"},
                },
                "required": ["query"],
            },
        ),

        # ── Chat ────────────────────────────────────────────────────────
        types.Tool(
            name="notebooklm_ask",
            description=(
                "Ask a question against the sources in a NotebookLM notebook. "
                "NotebookLM searches all indexed sources and returns a cited answer. "
                "Use this instead of loading full documents into Claude's context — "
                "it handles large corpora efficiently."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "notebook_id": {"type": "string", "description": "Notebook ID (optional)."},
                    "save_as_note": {
                        "type": "boolean",
                        "description": "Save the answer as a note in the notebook (default false).",
                    },
                },
                "required": ["question"],
            },
        ),
        types.Tool(
            name="notebooklm_history",
            description="Retrieve the chat history for a NotebookLM notebook.",
            inputSchema={
                "type": "object",
                "properties": {
                    "notebook_id": {"type": "string"},
                },
                "required": [],
            },
        ),

        # ── Generate ─────────────────────────────────────────────────────
        types.Tool(
            name="notebooklm_generate",
            description=(
                "Generate AI content from a NotebookLM notebook. "
                "Returns a task_id for tracking. "
                "artifact_type options:\n"
                "  audio       — podcast episode (deep-dive / brief / critique / debate)\n"
                "  video       — explainer video (explainer / brief)\n"
                "  slide-deck  — slide presentation (detailed / presenter)\n"
                "  quiz        — quiz with questions (JSON / markdown / html)\n"
                "  flashcards  — study flashcards (JSON / markdown / html)\n"
                "  report      — written report (briefing-doc / study-guide / blog-post / custom)\n"
                "  infographic — visual infographic (landscape / portrait / square)\n"
                "  mind-map    — mind map JSON (instant, no wait needed)\n"
                "  data-table  — structured CSV table"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "artifact_type": {
                        "type": "string",
                        "enum": ["audio", "video", "slide-deck", "quiz", "flashcards", "report", "infographic", "mind-map", "data-table"],
                    },
                    "notebook_id": {"type": "string", "description": "Notebook ID (optional)."},
                    "format": {
                        "type": "string",
                        "description": "Sub-format within the artifact type (e.g. 'deep-dive' for audio, 'briefing-doc' for report).",
                    },
                    "instructions": {
                        "type": "string",
                        "description": "Custom instructions / prompt for the generation.",
                    },
                    "language": {
                        "type": "string",
                        "description": "Output language code, e.g. 'he' for Hebrew, 'en' for English.",
                    },
                    "source_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Limit generation to specific source IDs (optional).",
                    },
                },
                "required": ["artifact_type"],
            },
        ),
        types.Tool(
            name="notebooklm_generate_wait",
            description=(
                "Wait for a NotebookLM generation task to complete. "
                "Call this after notebooklm_generate with the returned task_id. "
                "Long-running (audio/video can take 2-5 minutes)."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "artifact_type": {
                        "type": "string",
                        "enum": ["audio", "video", "slide-deck", "quiz", "flashcards", "report", "infographic", "data-table"],
                    },
                    "notebook_id": {"type": "string", "description": "Notebook ID (optional)."},
                    "timeout": {
                        "type": "integer",
                        "description": "Max seconds to wait (default 300 for audio/video, 120 for others).",
                    },
                },
                "required": ["artifact_type"],
            },
        ),
        types.Tool(
            name="notebooklm_download",
            description=(
                "Download a generated artifact from NotebookLM to a local file. "
                "Call after notebooklm_generate_wait confirms completion."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "artifact_type": {
                        "type": "string",
                        "enum": ["audio", "video", "slide-deck", "quiz", "flashcards", "report", "infographic", "data-table"],
                    },
                    "output_path": {
                        "type": "string",
                        "description": "Local file path to save to (e.g. './output/podcast.mp3').",
                    },
                    "format": {
                        "type": "string",
                        "description": "Download format override (e.g. 'pptx' for slide-deck, 'markdown' for quiz).",
                    },
                    "notebook_id": {"type": "string"},
                },
                "required": ["artifact_type", "output_path"],
            },
        ),

        # ── Notes ────────────────────────────────────────────────────────
        types.Tool(
            name="notebooklm_note_create",
            description=(
                "Create a note in a NotebookLM notebook. "
                "Use this to save Claude's analysis, summaries, or findings "
                "directly into the notebook for future reference."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {"type": "string", "description": "Note content (Markdown supported)."},
                    "title": {"type": "string", "description": "Optional note title."},
                    "notebook_id": {"type": "string"},
                },
                "required": ["content"],
            },
        ),
    ]


# ---------------------------------------------------------------------------
# Tool handlers
# ---------------------------------------------------------------------------

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:

    # ── Auth ─────────────────────────────────────────────────────────────
    if name == "notebooklm_auth_check":
        ok, out = await _run("auth", "check", "--test", timeout=20)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_login":
        ok, out = await _run("login", json_output=False, timeout=300)
        return _fmt(ok, out)

    # ── Notebooks ────────────────────────────────────────────────────────
    if name == "notebooklm_list":
        ok, out = await _run("list", timeout=30)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_create":
        title = arguments.get("title", "").strip()
        if not title:
            return [types.TextContent(type="text", text="Title is required.")]
        ok, out = await _run("create", title, timeout=30)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_use":
        nb_id = arguments.get("notebook_id", "").strip()
        ok, out = await _run("use", nb_id, json_output=False, timeout=20)
        return _fmt(ok, out)

    if name == "notebooklm_status":
        ok, out = await _run("status", timeout=20)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_delete":
        if not arguments.get("confirmed"):
            return [types.TextContent(
                type="text",
                text="Deletion requires confirmed=true. Ask the user to explicitly confirm before deleting.",
            )]
        nb_id = arguments.get("notebook_id", "").strip()
        ok, out = await _run("delete", "-n", nb_id, "--yes", json_output=False, timeout=30)
        return _fmt(ok, out)

    # ── Sources ──────────────────────────────────────────────────────────
    if name == "notebooklm_source_add":
        source = arguments.get("source", "").strip()
        if not source:
            return [types.TextContent(type="text", text="source is required.")]
        cmd = ["source", "add", source]
        if nb_id := arguments.get("notebook_id"):
            cmd = [*cmd[:2], "--notebook", nb_id, *cmd[2:]]
        ok, out = await _run(*cmd, timeout=60)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_source_list":
        cmd: list[str] = ["source", "list"]
        if nb_id := arguments.get("notebook_id"):
            cmd = [cmd[0], "--notebook", nb_id, cmd[1]]
        ok, out = await _run(*cmd, timeout=30)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_source_wait":
        source_id = arguments.get("source_id", "").strip()
        timeout = int(arguments.get("timeout", 120))
        cmd = ["source", "wait", source_id]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(2, "--notebook")
            cmd.insert(3, nb_id)
        ok, out = await _run(*cmd, timeout=timeout + 10)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_source_fulltext":
        source_id = arguments.get("source_id", "").strip()
        cmd = ["source", "fulltext", source_id]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(2, "--notebook")
            cmd.insert(3, nb_id)
        ok, out = await _run(*cmd, json_output=False, timeout=60)
        return _fmt(ok, out)

    if name == "notebooklm_source_research":
        query = arguments.get("query", "").strip()
        mode = arguments.get("mode", "fast")
        cmd = ["source", "add-research", query, "--mode", mode]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(2, "--notebook")
            cmd.insert(3, nb_id)
        ok, out = await _run(*cmd, timeout=120)
        return _fmt(ok, _pretty_json(out) if ok else out)

    # ── Chat ─────────────────────────────────────────────────────────────
    if name == "notebooklm_ask":
        question = arguments.get("question", "").strip()
        if not question:
            return [types.TextContent(type="text", text="question is required.")]
        cmd = ["ask", question]
        if arguments.get("save_as_note"):
            cmd.append("--save-as-note")
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(1, "--notebook")
            cmd.insert(2, nb_id)
        ok, out = await _run(*cmd, timeout=60)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_history":
        cmd = ["history"]
        if nb_id := arguments.get("notebook_id"):
            cmd = ["--notebook", nb_id, *cmd]
        ok, out = await _run(*cmd, timeout=30)
        return _fmt(ok, _pretty_json(out) if ok else out)

    # ── Generate ─────────────────────────────────────────────────────────
    if name == "notebooklm_generate":
        artifact = arguments.get("artifact_type", "").strip()
        if not artifact:
            return [types.TextContent(type="text", text="artifact_type is required.")]

        cmd = ["generate", artifact]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(1, "--notebook")
            cmd.insert(2, nb_id)
        if fmt := arguments.get("format"):
            cmd += ["--format", fmt]
        if lang := arguments.get("language"):
            cmd += ["--language", lang]
        if instructions := arguments.get("instructions"):
            cmd += ["--prompt", instructions]
        if source_ids := arguments.get("source_ids"):
            for sid in source_ids:
                cmd += ["--source", sid]

        # mind-map is instant
        timeout = 30 if artifact == "mind-map" else 60
        ok, out = await _run(*cmd, timeout=timeout)
        result_text = _pretty_json(out) if ok else out
        if ok and artifact != "mind-map":
            result_text += (
                "\n\n---\n"
                "Generation started. Call **notebooklm_generate_wait** with "
                f"artifact_type='{artifact}' to wait for completion, "
                "then **notebooklm_download** to save the file."
            )
        return _fmt(ok, result_text)

    if name == "notebooklm_generate_wait":
        artifact = arguments.get("artifact_type", "").strip()
        default_timeout = 360 if artifact in ("audio", "video") else 180
        timeout = int(arguments.get("timeout", default_timeout))
        cmd = ["artifact", "wait", artifact]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(1, "--notebook")
            cmd.insert(2, nb_id)
        ok, out = await _run(*cmd, timeout=timeout + 10)
        return _fmt(ok, _pretty_json(out) if ok else out)

    if name == "notebooklm_download":
        artifact = arguments.get("artifact_type", "").strip()
        output_path = arguments.get("output_path", "").strip()
        if not artifact or not output_path:
            return [types.TextContent(type="text", text="artifact_type and output_path are required.")]

        # ensure output directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

        cmd = ["download", artifact, output_path]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(1, "--notebook")
            cmd.insert(2, nb_id)
        if fmt := arguments.get("format"):
            cmd += ["--format", fmt]
        ok, out = await _run(*cmd, json_output=False, timeout=120)
        if ok:
            return [types.TextContent(type="text", text=f"Downloaded to `{output_path}`\n{out}")]
        return _fmt(False, out)

    # ── Notes ────────────────────────────────────────────────────────────
    if name == "notebooklm_note_create":
        content = arguments.get("content", "").strip()
        if not content:
            return [types.TextContent(type="text", text="content is required.")]
        cmd = ["note", "create"]
        if title := arguments.get("title"):
            cmd += ["--title", title]
        if nb_id := arguments.get("notebook_id"):
            cmd.insert(1, "--notebook")
            cmd.insert(2, nb_id)
        # pipe content via stdin-style: write to temp file
        tmp = Path("/tmp/_notebooklm_note.md")
        tmp.write_text(content, encoding="utf-8")
        cmd += ["--file", str(tmp)]
        ok, out = await _run(*cmd, timeout=30)
        return _fmt(ok, _pretty_json(out) if ok else out)

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
