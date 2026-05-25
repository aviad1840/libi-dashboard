# notebooks-mcp

MCP servers for Claude — local notebook folders + Google NotebookLM.  
Install once, activate in any project with one command.

## Install

```bash
pip install "git+https://github.com/aviad1840/libi-dashboard#subdirectory=notebooks-mcp"
```

With Google NotebookLM support:
```bash
pip install "git+https://github.com/aviad1840/libi-dashboard#subdirectory=notebooks-mcp[google]"
playwright install chromium
```

## First-time setup

```bash
notebooks-mcp setup          # installs deps, creates ~/.claude/notebooks.json
notebooks-mcp add research ~/docs/research   # register folders
notebooks-mcp login          # Google NotebookLM auth (opens browser)
notebooks-mcp desktop        # connect to Claude Desktop App (optional)
```

## Activate in any project

```bash
cd /any/project
notebooks-mcp init           # writes .claude/settings.json
claude                       # open Claude Code — tools are live
```

## Commands

| Command | What it does |
|---------|-------------|
| `notebooks-mcp setup` | Full first-time setup |
| `notebooks-mcp init [path]` | Activate in a project (creates `.claude/settings.json`) |
| `notebooks-mcp add NAME PATH` | Register a notebook folder |
| `notebooks-mcp remove NAME` | Remove a notebook |
| `notebooks-mcp list` | List all configured notebooks |
| `notebooks-mcp login` | Google NotebookLM auth |
| `notebooks-mcp desktop` | Connect to Claude Desktop App |

## Tools exposed to Claude

### Local notebooks (`notebook_*`)
- `notebook_list` — list configured notebooks
- `notebook_context NAME` — load all files as context
- `notebook_search NAME QUERY` — keyword search
- `notebook_add NAME PATH` — add notebook

### Google NotebookLM (`notebooklm_*`)
18 tools covering: auth · notebook management · source ingestion ·
chat with citations · generate (audio / video / slides / quiz /
flashcards / report / infographic / mind-map / data-table) · download · notes

## Config

Notebooks are stored in `~/.claude/notebooks.json` (global, not per-project):
```json
{
  "notebooks": {
    "my-notes": {
      "path": "/Users/you/Documents/notes",
      "description": "Research notes"
    }
  }
}
```
