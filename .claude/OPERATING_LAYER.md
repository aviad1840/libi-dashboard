# Claude Knowledge Layer

## Available MCP Tools

Two servers are active when running Claude Code locally:

**`notebook_*`** — local folders registered in `~/.claude/notebooks.json`
- `notebook_list` · `notebook_context <name>` · `notebook_search <name> <query>` · `notebook_add <name> <path>`

**`notebooklm_*`** — Google NotebookLM account (18 tools)
- Notebooks: list, create, use, status
- Sources: add (URL/PDF/YouTube/text), wait, fulltext, web research
- Chat: ask (cited answers), history
- Generate: audio · video · slide-deck · quiz · flashcards · report · infographic · mind-map · data-table
- Notes: create (save findings permanently)

---

## When to use tools — without being asked

**Use `notebook_search` or `notebook_context` when:**
- User mentions a topic that resembles a registered notebook name
- Question references previous work, prior decisions, or ongoing initiatives
- Context from a prior session would clearly improve the answer

**Use `notebooklm_ask` or `notebooklm_source_add` when:**
- Document is large or the user uploads a heavy PDF
- Research should persist beyond this session
- Multiple documents need cross-referencing

**Do NOT auto-run `notebooklm_generate`** — generation takes time and quota.
Always confirm: *"Want me to generate a [type] from this?"*

---

## Lightweight session start

If the first message suggests a **complex or ongoing topic**:
1. Run `notebook_list` silently (one call)
2. If a relevant notebook exists, mention it: *"I see a 'research' notebook — want me to load context?"*

Skip this for simple or clearly one-off questions.

---

## Decision memory — offer, don't mandate

When a significant decision is reached, offer once:
> *"Want me to save this to NotebookLM? I'll preserve the rationale and alternatives."*

Never auto-save without asking.

---

## Notebook naming

When creating notebooks, follow a simple hierarchy:
`/strategy` · `/projects/<name>` · `/research` · `/meetings` · `/decisions` · `/prompts` · `/governance`

Avoid duplicates — check `notebooklm_list` before creating.

---

## Source trust

Distinguish clearly: Government/legislation > Academic > Industry reports > Vendor > Speculative.
Never mix tiers without flagging it.

---

## For strategic or AI proposals — add a risk note

Flag: privacy · regulatory · procurement · adoption barriers · scalability.
Keep it concise — one short paragraph, not a full audit unless asked.
