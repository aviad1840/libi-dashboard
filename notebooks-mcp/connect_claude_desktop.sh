#!/usr/bin/env bash
# Connect notebooks-mcp to Claude Desktop App (mac / windows / linux)
# Run: bash notebooks-mcp/connect_claude_desktop.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$(which python3)"

# ── Locate Claude Desktop config ──────────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
  CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
  CONFIG_DIR="${APPDATA}/Claude"
else
  # Linux / other
  CONFIG_DIR="$HOME/.config/Claude"
fi

CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
mkdir -p "$CONFIG_DIR"

# ── Build the mcpServers block ─────────────────────────────────────────────
NEW_SERVERS=$(cat << JSON
{
  "notebooks": {
    "command": "$PYTHON",
    "args": ["$SCRIPT_DIR/server.py"]
  },
  "google-notebooklm": {
    "command": "$PYTHON",
    "args": ["$SCRIPT_DIR/google_notebooklm_server.py"]
  }
}
JSON
)

# ── Merge into existing config (or create new) ─────────────────────────────
if [ -f "$CONFIG_FILE" ]; then
  echo "▸ Found existing config: $CONFIG_FILE"
  # Use Python to safely merge JSON
  "$PYTHON" - "$CONFIG_FILE" "$NEW_SERVERS" << 'PYEOF'
import json, sys
config_path = sys.argv[1]
new_servers  = json.loads(sys.argv[2])

with open(config_path) as f:
    config = json.load(f)

config.setdefault("mcpServers", {}).update(new_servers)

with open(config_path, "w") as f:
    json.dump(config, f, indent=2, ensure_ascii=False)

print("  ✅ Merged successfully.")
PYEOF
else
  echo "▸ Creating new config: $CONFIG_FILE"
  "$PYTHON" - "$CONFIG_FILE" "$NEW_SERVERS" << 'PYEOF'
import json, sys
config_path = sys.argv[1]
new_servers  = json.loads(sys.argv[2])
config = {"mcpServers": new_servers}
with open(config_path, "w") as f:
    json.dump(config, f, indent=2, ensure_ascii=False)
print("  ✅ Created successfully.")
PYEOF
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Claude Desktop connected!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Config: $CONFIG_FILE"
echo ""
echo "  Next steps:"
echo "  1. Restart Claude Desktop App (quit completely, reopen)"
echo "  2. In any conversation, Claude will now have access to:"
echo "     • notebook_* tools  (local folders)"
echo "     • notebooklm_* tools (Google NotebookLM)"
echo ""
echo "  If not already done, authenticate with Google:"
echo "    notebooklm login"
echo ""
