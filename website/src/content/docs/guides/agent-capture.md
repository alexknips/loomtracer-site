---
title: Agent Capture
description: Let Claude Code and Codex capture decisions automatically — no API key required on your server.
---

Loomtracer ships installable capture bundles for **Claude Code** and **Codex**. Agents
capture decisions directly into the local ledger or a self-hosted cell — no
`ANTHROPIC_API_KEY` on the server is required.

This page covers the write path. For consulting, verifying, and contesting
decisions that already exist by description rather than by id, see the
[`hivemind-context` plugin](https://github.com/alexknips/loomtracer/blob/master/docs/AGENT_DECISION_CONTEXT.md).

## Two capture paths

| Path | When to use | API key on server? |
|------|-------------|-------------------|
| **Direct** (`emit decision.capture`) | Single, deterministic decision at the moment it's made | Not required |
| **Batch / keyless** (`emit ingest.batch_classified`) | Retrospective extraction over accumulated context | Not required — runs on your Claude subscription |

The server-side background classifier (`ANTHROPIC_API_KEY` on the server) is optional.
The keyless path spawns a Haiku subagent inside your own Claude session and submits
pre-classified captures directly to the ledger. If your server has an API key
configured, the background classifier picks up `enqueue-capture` batches instead.

## Install

### Claude Code — marketplace

```text
/plugin marketplace add alexknips/hivemind
/plugin install hivemind-capture@hivemind
/reload-plugins
```

This installs five commands, one skill and an MCP server. The server runs the `hivemind` binary,
so [install it](../../getting-started/quickstart/) first.

| Command / skill / tool | What it does |
|-------------|-------------|
| `/hivemind-capture:capture` | Capture one decision-memory item to the local ledger |
| `/hivemind-capture:capture-decision` | Capture a single decision (the older, decision-only path) |
| `/hivemind-capture:query-decisions` | "What did we decide about X?" — free-text recall of the ledger |
| `/hivemind-capture:batch-capture` | Classify recent conversation and capture its decisions in one batch, keyless |
| `/hivemind-capture:classify-queue` | Work through the classification queue on your own subscription |
| `hivemind-capture` skill | Tells the agent when and how to capture |
| `hivemind` MCP server | Full write + query access via MCP tools |

### Codex

From a local checkout of the `hivemind` repository: open `/plugins`, choose `HiveMind Plugins`, and
install `HiveMind Capture` (the plugins still carry the tool's name).

From another checkout or machine, add the repository as a marketplace, then install the bundle:

```bash
codex plugin marketplace add https://github.com/alexknips/hivemind.git
codex plugin add hivemind-capture@hivemind-plugins
```

Or copy the skill bundle directly:

```bash
cp -r plugins/hivemind-capture/skills/hivemind-capture "$HOME/.agents/skills/"
```

## Direct capture — single decision

Use `emit decision.capture` for a single, deterministic decision you're making
right now. This is the preferred path for in-the-moment choices.

```bash
hivemind --hivemind-dir ./hivemind/ emit decision.capture \
  --title "Use direct CLI capture for agent decisions" \
  --rationale "The local command is deterministic and does not depend on hooks" \
  --topic-keys agents,capture \
  --options direct-cli,mcp \
  --chose direct-cli \
  --rests-on-assumption "Not every agent runtime offers hooks"
```

A capture must say what the decision rests on: `--rests-on-decision`, `--rests-on-evidence`
(with `--evidence-source`), `--rests-on-assumption`, or `--bet` when there is nothing yet. One
that names nothing is refused and nothing is written.

Actor identity is derived automatically, stable name first: a Gas City
agent's fixed slot name (`GC_AGENT`/`GC_ALIAS`) before any raw per-run
session environment variable (`CLAUDE_SESSION_ID`, `CODEX_THREAD_ID`, etc.).
Use `--agent-tool` and `--agent-session` only when overriding the defaults.

## Batch capture (keyless)

For retrospective extraction over a batch of conversation turns, spawn a Haiku
subagent inside your own session. Classification runs on your Claude subscription —
no `ANTHROPIC_API_KEY` is read from the server environment.

### When to use the batch path

- You have accumulated context to classify at once.
- Your server does not have `ANTHROPIC_API_KEY` configured (self-hosted zero-key deployment).
- You want extraction to complete immediately rather than waiting for the server's background poll.

### Batch capture workflow

1. Spawn a Haiku subagent with the classifier prompt (see `plugins/hivemind-capture/skills/hivemind-capture/SKILL.md` for the full prompt template). The subagent returns a JSON array of `CaptureItem` objects.

2. Write the output and submit:

```bash
cat > /tmp/hivemind-captures.json <<'EOF'
[ { "kind": "decision", "title": "...", "rationale": "...", ... } ]
EOF

HIVEMIND_AGENT_SESSION="${GC_AGENT:-${GC_ALIAS:-${CLAUDE_SESSION_ID:-${CLAUDE_CODE_SESSION_ID:-${GC_SESSION_ID:-manual-session}}}}}"
hivemind --hivemind-dir ./hivemind/ emit ingest.batch_classified \
  --captures /tmp/hivemind-captures.json \
  --agent-tool claude \
  --agent-session "$HIVEMIND_AGENT_SESSION" \
  --classifier-model "claude-haiku-4-5-20251001"
```

3. Verify the captures are visible:

```bash
hivemind --hivemind-dir ./hivemind/ query recall --limit 5
```

The server's background classifier does not reprocess plugin-submitted batches —
`ingest.batch_classified` events are already classified and the background worker
only processes `ingest.batch_received` events.

### Checking the classify queue

When the server-side classifier is enabled (`ANTHROPIC_API_KEY` configured),
`enqueue-capture` queues activity for background classification. Use
`classify-queue` to inspect:

```bash
hivemind --hivemind-dir ./hivemind/ classify-queue list
hivemind --hivemind-dir ./hivemind/ classify-queue submit --batch-id <id>
```

Pass `--limit N` to cap the number of batches per run (default: 20).

This means you can self-host Loomtracer with zero external API keys and still get
fully classified decisions — you just run the classify command rather than
relying on the server's background worker.

See the [keyless capture walkthrough](https://github.com/alexknips/loomtracer/blob/master/docs/KEYLESS_CAPTURE.md)
for a zero-to-first-decision guide.

## What agents should capture

The capture classifier (layer 3) distinguishes signal from noise. In practice:

**Capture:**
- A choice between implementation approaches where the rationale is non-obvious
- A decision that future agents or humans will need to understand
- A reversal of a previous decision (use the [`supersede`](../../reference/cli/#supersede) command)

**Don't capture:**
- Mechanical steps (reading a file, running a test)
- Exploratory actions with no committed outcome
- Status updates or progress notes

The classifier measures ~92% of agent activity as noise in production. The 8%
that becomes a captured decision is the part that matters six months later.

## Reviewing agent and document decisions

What your agents decided is yours to look over, one by one, in the terminal:

```bash
hivemind review --actor 'agent:*' --since 7d --unreviewed-only
```

Approve, disagree or supersede each one; [Human Review](../human-review/) has the details.
