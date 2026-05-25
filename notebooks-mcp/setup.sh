#!/usr/bin/env bash
# Notebooks MCP — one-time setup
# Run from the project root: bash notebooks-mcp/setup.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Notebooks MCP — Setup"
echo "═══════════════════════════════════════════════════"
echo ""

# ── 1. Python deps ──────────────────────────────────────────────────────────
echo "▸ Installing Python dependencies..."
pip install --quiet "mcp>=1.0.0" "notebooklm-py[playwright]"
playwright install chromium --quiet 2>/dev/null || true
echo "  ✅ Python deps installed"

# ── 2. ~/.claude/notebooks.json ────────────────────────────────────────────
NOTEBOOKS_JSON="$HOME/.claude/notebooks.json"
mkdir -p "$HOME/.claude"

if [ ! -f "$NOTEBOOKS_JSON" ]; then
  echo ""
  echo "▸ Creating ~/.claude/notebooks.json ..."
  cat > "$NOTEBOOKS_JSON" << JSONEOF
{
  "notebooks": {
    "libi": {
      "path": "$REPO_ROOT",
      "description": "לב dashboard source code"
    }
  }
}
JSONEOF
  echo "  ✅ Created $NOTEBOOKS_JSON"
  echo "  Edit it to add more notebook folders."
else
  echo "  ℹ️  ~/.claude/notebooks.json already exists — skipping."
fi

# ── 3. Claude desktop config (if applicable) ────────────────────────────────
# Detect platform-specific Claude desktop config
CLAUDE_DESKTOP_CONFIGS=(
  "$HOME/.config/Claude/claude_desktop_config.json"         # Linux
  "$HOME/Library/Application Support/Claude/claude_desktop_config.json"  # macOS
  "$APPDATA/Claude/claude_desktop_config.json"              # Windows (via env)
)

DESKTOP_CONFIG=""
for cfg in "${CLAUDE_DESKTOP_CONFIGS[@]}"; do
  if [ -f "$cfg" ]; then
    DESKTOP_CONFIG="$cfg"
    break
  fi
done

echo ""
echo "▸ MCP server paths:"
echo "  Local folders: $SCRIPT_DIR/server.py"
echo "  Google NbLM  : $SCRIPT_DIR/google_notebooklm_server.py"

if [ -n "$DESKTOP_CONFIG" ]; then
  echo ""
  echo "  Found Claude Desktop config: $DESKTOP_CONFIG"
  echo "  Add the following to the mcpServers section:"
fi

echo ""
echo "───────────────────────────────────────────────────"
echo "  Add to .claude/settings.json (Claude Code / VS Code):"
echo "  OR to claude_desktop_config.json (Claude Desktop app):"
echo "───────────────────────────────────────────────────"
cat << CFGEOF
{
  "mcpServers": {
    "notebooks": {
      "command": "python3",
      "args": ["$SCRIPT_DIR/server.py"]
    },
    "google-notebooklm": {
      "command": "python3",
      "args": ["$SCRIPT_DIR/google_notebooklm_server.py"]
    }
  }
}
CFGEOF

# ── 4. .claude/settings.json ───────────────────────────────────────────────
SETTINGS="$REPO_ROOT/.claude/settings.json"
mkdir -p "$REPO_ROOT/.claude"

cat > "$SETTINGS" << SETTINGSEOF
{
  "mcpServers": {
    "notebooks": {
      "command": "python3",
      "args": ["$SCRIPT_DIR/server.py"]
    },
    "google-notebooklm": {
      "command": "python3",
      "args": ["$SCRIPT_DIR/google_notebooklm_server.py"]
    }
  }
}
SETTINGSEOF
echo ""
echo "  ✅ Updated $SETTINGS"

# ── 5. Login prompt ────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "  FINAL STEP: Authenticate with Google NotebookLM"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Run this to log in (opens a browser window):"
echo ""
echo "    notebooklm login"
echo ""
echo "  After login, all 18 Google NotebookLM tools will be"
echo "  available to Claude in every session."
echo ""
