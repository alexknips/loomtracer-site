---
title: MCP Setup
description: Connect Claude Code, Codex, Cursor, or any MCP client to your self-hosted Loomtracer.
---

Loomtracer's command-line tool, `loomtracer`, exposes its full decision-graph surface as an MCP server. Connect your agents
to your **self-hosted cell** over HTTP (a shared, team-wide decision graph), or run the
**local stdio server** yourself for single-user use.

---

## Self-hosted cell — HTTP

Your [self-hosted cell](../../getting-started/quickstart/#run-a-cell-with-docker) serves MCP at `/mcp`. Agents
connect to that endpoint and write to a shared, team-wide decision graph — no local
binary required on the agent's machine. **Authentication is a bearer token:**
[provision a tenant](../../getting-started/quickstart/#connect-your-agent-to-the-cell) and use the
`lt_tk_...` token it returns. The examples below use `http://localhost:8080/mcp`;
substitute your cell's address.

### Claude Code

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "loomtracer": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": { "Authorization": "Bearer lt_tk_..." }
    }
  }
}
```

Or from the CLI:

```bash
claude mcp add --transport http loomtracer http://localhost:8080/mcp \
  --header "Authorization: Bearer lt_tk_..."
```

Reload Claude Code and all `loomtracer` tools are available.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "loomtracer": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "headers": { "Authorization": "Bearer lt_tk_..." }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json` or the project-level `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "loomtracer": {
      "url": "http://localhost:8080/mcp",
      "headers": { "Authorization": "Bearer lt_tk_..." }
    }
  }
}
```

### Codex

Put the token in an environment variable and register the cell:

```bash
export LOOMTRACER_TOKEN=lt_tk_...
codex mcp add loomtracer --url http://localhost:8080/mcp --bearer-token-env-var LOOMTRACER_TOKEN
```

Codex writes the server to `~/.codex/config.toml` and reads the bearer token from that variable.

---

## Local stdio MCP

For single-user use, run the local stdio server. The server
is a thin transport over the same commands layer the CLI uses.

### Start the server

```bash
loomtracer --loomtracer-dir ./loomtracer/ mcp
```

The server reads from stdin and writes to stdout in the MCP protocol format.

### Claude Desktop (local)

```json
{
  "mcpServers": {
    "loomtracer": {
      "command": "loomtracer",
      "args": ["mcp"],
      "env": {
        "LOOMTRACER_DIR": "/absolute/path/to/your/loomtracer/dir"
      }
    }
  }
}
```

### Claude Code (local)

Add to `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "loomtracer": {
      "command": "loomtracer",
      "args": ["--loomtracer-dir", "./loomtracer/", "mcp", "--agent-tool", "claude"]
    }
  }
}
```

Or set `LOOMTRACER_DIR` and omit `--loomtracer-dir`:

```json
{
  "mcpServers": {
    "loomtracer": {
      "command": "loomtracer",
      "args": ["mcp", "--agent-tool", "claude"],
      "env": { "LOOMTRACER_DIR": "./loomtracer/" }
    }
  }
}
```

`--agent-tool claude` files captures under Claude Code (see [Who a capture is filed under](#who-a-capture-is-filed-under-local-stdio)).

### Cursor (local)

```json
{
  "mcpServers": {
    "loomtracer": {
      "command": "loomtracer",
      "args": ["mcp", "--agent-tool", "cursor"],
      "env": { "LOOMTRACER_DIR": "/path/to/loomtracer/" }
    }
  }
}
```

### Codex (local)

```bash
codex mcp add loomtracer -- loomtracer mcp --agent-tool codex
```

This writes the server to `~/.codex/config.toml`; `codex mcp list` shows it enabled.

```toml
[mcp_servers.loomtracer]
command = "loomtracer"
args = ["mcp", "--agent-tool", "codex"]
```

---

## Available tools

The `loomtracer` MCP server exposes 40 tools. See [MCP Tools reference](../../reference/mcp-tools/)
for full parameter documentation.

| Tool | Type | Description |
|------|------|-------------|
| `capture_decision` | write | Record a decision with rationale and options |
| `capture_evidence` | write | Record supporting evidence for a decision |
| `capture_hypothesis` | write | Record a hypothesis still in flight |
| `disagree_decision` | write | Contest a decision as an actor |
| `supersede_decision` | write | Supersede a prior decision with a new one |
| `move_decision` | write | Move a decision to another project, recorded with who, when, from, to and why |
| `retitle_decision` | write | Rename a decision; the old title stays readable |
| `link_supersession` | write | Record that one already-recorded decision replaces another, keeping its own decider |
| `ground_decision` | write | Say what an existing decision rests on, after the fact |
| `reaffirm_decision` | write | Say a decision still holds after something it rests on changed |
| `request_decision` | write | Ask a question before any decision answers it |
| `acknowledge_suggestion` | write | Record that a finding from `get_suggestions` was looked at |
| `get_decision` | read | Retrieve a decision by ID with derived status |
| `get_relevant_decisions` | read | Search by topic, status, actor, or time window |
| `get_situational_decisions` | read | Decisions bearing on a situation — matches by topic or evidence overlap, no ID needed |
| `get_supersession_chain` | read | Walk the full supersession history backward |
| `get_decision_neighborhood` | read | One-hop graph neighborhood around a decision — actors, options, evidence, hypotheses |
| `search_decisions` | read | Full-text search across the ledger |
| `recent_decisions` | read | List recently proposed decisions |
| `dump_graph` | read | Export the full projected graph (DOT or JSON) |
| `get_decision_outcome` | read | Whether a decision still holds — superseded, stale premises, or contested |
| `get_reexamine_items` | read | Decisions resting on something that changed that nobody has looked at again |
| `get_waiting_requests` | read | Questions asked that no decision answers yet, oldest first |
| `get_contested_decisions` | read | Decisions in contest: who accepted and who rejected, or conflicting answers |
| `get_changed_decisions` | read | Decisions revised or superseded in a window, with what changed and who changed it |
| `get_open_why_decisions` | read | Binding decisions whose why is still to answer |
| `loomtracer_compact_view` | layer-3 | Compact summary of a decision and its context |
| `recall_decisions` | layer-3 | Search + ranked digest — answers "what was decided about X?" |
| `summarize_decisions` | layer-3 | Concise text summary of one or more decisions |
| `decision_quality_candidates` | layer-3 | Bulk quality-signal pull for external scorers |
| `get_decision_context` | layer-3 | Context record for a decision — authorship, review depth, evidence richness |
| `decision_context_candidates` | layer-3 | Bulk context-feature pull, the independent-variable side of quality scoring |
| `score_decision` | layer-3 | The quality profile of one decision: seven dimensions, no score, no tier |
| `scan_decision_quality` | layer-3 | Attention findings: decisions that need a look, such as a bet past its check date |
| `get_suggestions` | layer-3 | The attention findings nobody has acknowledged yet |
| `rank_decisions_by_importance` | layer-3 | Which decisions carry the most impact, each with who decided it |
| `scan_misfiled_decisions` | layer-3 | Flag decisions carrying a caller-named "foreign" topic key — report only, never moves anything |
| `analyze_failure_modes` | layer-3 | Aggregate failure-rate patterns across authorship, review, and context |
| `classify_queue_list` | read | List pending ingest batches with turn text, plus today's classification budget (HTTP transport only) |
| `classify_queue_submit` | write | Submit captures for one or more pending batches as one classification event (HTTP transport only) |

---

## Who a capture is filed under (local stdio)

A capture call may name its actor in `actor_id`; it is optional. Without one, the server records
`agent:<tool>:mcp-<session-id>`, and a capture that names no `project` lands in that agent's
personal project. `<tool>` comes from `--agent-tool` on the server's command line, so name your
client there:

```
loomtracer mcp --agent-tool claude    # Claude Code
loomtracer mcp --agent-tool codex     # Codex
loomtracer mcp --agent-tool cursor    # Cursor
```

Without the flag the server usually cannot tell which client started it, and files captures under
`codex`. The server records `source=agent` and a per-session `source_ref` for every write.

---

## Next steps

- [MCP Tools reference](../../reference/mcp-tools/) — full parameter documentation for all 40 tools
- [Agent Capture guide](../agent-capture/) — how agents capture decisions automatically
- [Quickstart](../../getting-started/quickstart/) — install the binary, or run your own cell with Docker
