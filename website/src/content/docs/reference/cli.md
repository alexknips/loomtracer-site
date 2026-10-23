---
title: CLI Reference
description: Complete reference for loomtracer, Loomtracer's command-line tool.
---

`loomtracer` is Loomtracer's command-line tool. This page lists its flags and commands.

## Global flags

| Flag | Description |
|------|-------------|
| `--actor <id>` | Actor making this request. Format: `human:<id>` or `agent:<tool>:<name>` |
| `--loomtracer-dir <path>` | Ledger directory (default: `./loomtracer/`). Created on first write. |
| `--tenant <id>` | Tenant to read/write (default: `local`). Must already be a known tenant — see [Tenants](#tenants) below. |
| `--database-url <url>` | Shared Postgres backend connection URL. Unset or empty selects the local SQLite ledger under `--loomtracer-dir` instead. A flag value beats `LOOMTRACER_DATABASE_URL`. Requires the `shared-backend-postgres` feature. |
| `--json` | Emit structured JSON output |
| `--graph-backend <memory\|kuzu>` | Graph projection backend (default: `memory`) |

## Tenants

Every ledger open — CLI, HTTP API, and stdio MCP alike — validates `--tenant`
(or `X-Loomtracer-Tenant` on the HTTP API) against a per-backend tenant
registry before any read or write. An unknown tenant is a hard error, not a
fresh empty scope: a typo'd `--tenant` must never look indistinguishable from
"this tenant just has no decisions yet."

**Default:** `--tenant local` (env `LOOMTRACER_TENANT`). The `local` tenant is
seeded automatically for every SQLite ledger directory, so single-user/local
workflows need no tenant setup.

**SQLite — `loomtracer tenant create`:** tenants are a per-`--loomtracer-dir`
registry. Register a new one with:

```
loomtracer tenant create <tenant-id>
```

Creates the tenant in the ledger directory named by
`--loomtracer-dir`/`LOOMTRACER_DIR` (errors if it already exists there). Add
`--json` for a structured `{tenant_id, loomtracer_dir}` result. This subcommand
is SQLite-only — pointed at a Postgres backend (`--database-url` set) it
fails immediately, since Postgres tenants are provisioned server-side, not
by any CLI invocation.

**Postgres — server provisioning route:** tenants live in the shared
`hm_tenants` table and are created only through the server's admin-gated
`POST /v1/tenants` route (requires `LOOMTRACER_ADMIN_KEY`). There is no CLI
equivalent by design — this is the same route the HTTP API's per-user and
WorkOS-OIDC auth paths depend on to have a tenant to resolve a caller into.

**The unknown-tenant error:** on both backends, opening a ledger for an
unregistered tenant fails with an error naming the tenant and the
backend-specific create path instead of silently opening a fresh, empty
scope:

```
unknown tenant 'acme-inc': run `loomtracer tenant create acme-inc` to register it
```

```
unknown tenant 'acme-inc': tenants are created through the server's provisioning route (POST /v1/tenants), not the CLI
```

On the HTTP API this surfaces as `404 Not Found` for every read and write
endpoint alike (a wrong address, not a validation or server error). In
Postgres multi-tenant mode, clients never send a tenant header at all — the
bearer token (or, with WorkOS configured, the JWT's `org_id` claim) resolves
to the tenant server-side; `X-Loomtracer-Tenant` only applies to SQLite
dev-mode auth, where it defaults to `local` when absent.

## Projects

A project is a named home for decisions inside a tenant. Every decision
belongs to exactly one project. Two kinds:

- **Shared project** — registered explicitly, by handle (`billing`:
  lowercase letters, digits, dashes; 2–40 characters; unique per tenant).
  Can carry **anchors** (a folder, a rig, a Jira/Linear/GitHub reference, a
  channel) and **links** to other projects: `part_of` (at most one active
  parent) and `depends_on` (no limit).
- **Personal project** — derived from the actor id (`personal:human:alice`,
  `personal:agent:claude`), never registered, always resolves. Comes with
  the identity, so it "cannot be a typo."

`project show` on an unknown handle returns a successful envelope with
`{"outcome": "not_found"}`, never an error — a miss is data, not an
exceptional condition.

### `project register`

```
loomtracer --actor human:<id> project register <handle>
  [--display-name <name>]
  [--purpose <text>]
```

Registers a shared project. Refused if the handle is malformed, already
registered (names the existing project), or uses the reserved `personal:`
prefix.

### `project link` / `project unlink`

```
loomtracer --actor human:<id> project link --from <handle> --to <handle> --kind <part_of|depends_on>
loomtracer --actor human:<id> project unlink --from <handle> --to <handle> --kind <part_of|depends_on>
```

Links (or removes a link between) two registered projects. Both endpoints
must already be registered; `part_of` is refused if `from` already has a
different active parent; `unlink` is refused when no such link is
currently active.

### `project anchor`

```
loomtracer --actor human:<id> project anchor --handle <handle> --kind <folder|rig|jira|linear|github|channel> --value <value>
```

Anchors a registered project to a place in the world. A `rig` anchor value
is unique per tenant.

### `project list`

```
loomtracer project list [--limit <n>] [--cursor <cursor>]
```

Lists registered (shared) projects, paged (`truncated: true` with a
`next_cursor` when the limit is hit). Personal projects never appear here —
resolve one directly with `project show`.

### `project decisions`

```
loomtracer project decisions <handle> [--limit <n>] [--cursor <cursor>]
```

Lists the decisions in one project, oldest first, paged (default `--limit 25`;
`truncated: true` with a `next_cursor` when the limit is hit). Give a shared
handle, or a personal address (`personal:<actor>`) to see what is still in a
personal project and not yet shared: every session of one agent tool lists
together (`personal:agent:claude`), each decision showing its session. An
unregistered handle is a successful envelope with `outcome: not_found`, never
an empty list.

### `project show`

```
loomtracer project show <handle>
loomtracer project show --current
```

Shows one project by handle, or a personal address
(`personal:<actor-id>`), which always resolves. `--current` shows the
actor's current-project setting (see `project use`) instead.

### `project use`

```
loomtracer --actor human:<id> project use <handle>
loomtracer --actor human:<id> project use --clear
```

Sets or clears the actor's **current project**: a one-time, per-machine
setting for captures with no repo or folder context (e.g. chat), consulted
below any folder marker or rig anchor. Local to `--loomtracer-dir` and the
actor — it is never a ledger fact, so setting or clearing it appends no
event. Setting an unregistered handle is refused with a hint to register it
first.

## Emit commands

All `emit` commands append an event to the ledger. They require `--actor`.

### `emit decision.proposed`

```
loomtracer emit decision.proposed
  --title <text>
  --rationale <text>
  [--topic-keys <key,key,...>]
  [--options <opt,opt,...>]
  [--chose <option>]
  [--decided-by <actor-id>]
  [--delegated-by <human:name>]
  [--still-proposed]
  [--quote <text>]
  [--question <text>]
  [--project <handle>]
  [--project-source <stated|folder_marker|rig|current_project|job>]
```

Prints the new decision ID on success, and only the ID on stdout, so
`id=$(loomtracer emit ...)` keeps working. In text mode a second line on stderr
names the project the decision landed in: `project: <address> (<source>)`, plus
"saved to your personal project" when no `--project` was given. Add `--json`
for a structured envelope; it carries `project` and `project_source` (and
`project_notice` on the personal fallback) next to the ID.

There is no `--supersedes` flag on this command. To capture a decision that
reverses a prior one, use [`supersede`](#supersede) instead — it captures the
new decision and marks the old one superseded in a single call.

`--chose <option>` means the decision was already made: by default the command
self-accepts it immediately after proposing, via a `decision.accepted` event
from `--actor`. `--decided-by <actor-id>` names the actor who actually made the
decision when that differs from `--actor` (the recording actor/scribe) — for
example an agent writing down a decision a human made: `--actor
agent:claude:session --decided-by human:alex`; the accept event comes from
`--decided-by` instead. Requires `--chose`.

`--delegated-by <human:name>` marks an agent that decided for itself within a
scope a human delegated to it: the self-acceptance carries the delegating human,
so the record tells "the agent decided under a human's delegation" apart from
"the agent decided alone" (no flag). `--actor` must be an `agent:` actor, and a
`--decided-by` naming anyone else is refused — a human who decided is recorded
with `--decided-by`. Requires `--chose`. A standing delegation is the same value
repeated on each capture in that scope.

`--still-proposed` keeps the decision at `proposed` even though `--chose` is
set, for a genuine open recommendation awaiting someone else's decision.
Mutually exclusive with `--decided-by` and `--delegated-by`.

`--quote <text>` captures the verbatim words of the decider, self-contained —
not a bare reference like `"1a"` into a numbered list that only makes sense
next to the source conversation. It requires `--question <text>`: the
question those words answer, spelled out in the capturer's own words. Neither
flag works without the other — a quote with no stated question is unreadable
once the source conversation is gone.

`--project <handle>` files the decision under a registered project. An unknown
handle is refused with the [`project register`](#project-register) command to
run, and nothing is written. `loomtracer` checks the handle; it never works out
the project for you, so pass the one you know. Without `--project` the decision
is saved to the recorder's personal project (`personal:<actor>`, derived from
the actor, never registered) and the reply says so. `--project-source` records
how the handle was determined (default `stated`) and requires `--project`;
`personal_fallback` and `moved` are recorded by `loomtracer` itself and cannot be
claimed.

### `emit decision.capture`

Noninteractive shorthand, the everyday write. Without a typed `--actor` it records the
agent in an agent session (`agent:<tool>:<name>`, `source=agent`) and the git user at a
plain terminal (`human:<git email>`, `source=human`).

```
loomtracer emit decision.capture
  --title <text>
  --rationale <text>
  [--topic-keys <key,...>]
  [--options <opt,...>]
  [--chose <option>]
  [--decided-by <actor-id>]
  [--delegated-by <human:name>]
  [--still-proposed]
  [--quote <text>]
  [--question <text>]
  [--project <handle>]
  [--project-source <stated|folder_marker|rig|current_project|job>]
  [--rests-on-decision <description|#N|decision-id>]...
  [--rests-on-evidence <what was observed>]... [--evidence-source <where>]...
  [--rests-on-assumption <statement>]...
  [--bet [<statement>]] [--would-change-if <text>] [--check-by <date>]
  [--confidence <low|medium|high>]
  (--binds <what> | --binds-nothing)
  (--undo-cost <what> | --cheap-to-undo)
  [--answers <request-id>]
```

Takes the same `--project` / `--project-source` flags and replies the same way
as [`emit decision.proposed`](#emit-decisionproposed).

**A capture must say what it rests on.** Name at least one of the following, or
the capture is refused and nothing is written:

- `--rests-on-decision <description|#N|decision-id>` — a decision we already
  made, named the way you would describe it, as `#N` from the previous
  ambiguous candidate list, or by `decision-...` id. Repeatable. A description
  that is ambiguous or matches nothing refuses the capture.
- `--rests-on-evidence <content>` — something observed, the observation itself
  rather than the decider's opinion of it. Repeatable; creates the evidence in
  the same call. Give each one an `--evidence-source <ref>` (URL, file@commit,
  test run, measurement), matched by position, or none.
- `--rests-on-assumption <statement>` — something assumed. Repeatable; creates
  an assumption in the same call.
- `--bet [<statement>]` — nothing yet: declare the decision a bet on the
  statement, or on `Judgement call: <title>` when none is given.
  `--would-change-if <text>` says what would change our mind and
  `--check-by <date>` (RFC3339 or `YYYY-MM-DD`) when to check whether it paid
  off; both require `--bet`.

The ids of nodes that already exist also count (`--evidence`, `--hypotheses`).
`--confidence <low|medium|high>` records the decider's own stated confidence;
leave it off when they expressed none. The decider's own words are not a
grounding: they go in `--quote` with `--question`. If a decision named under
`--rests-on-decision` is already superseded or rejected, the capture succeeds,
the link is recorded, and text mode adds a `premise_stale:` line for it.

**A capture must also say what it binds and what undoing it would cost.** Give
`--binds <what>` (other people, other code, a later choice, in one sentence) or
`--binds-nothing`, and `--undo-cost <what>` or `--cheap-to-undo`. A capture that
leaves either out is refused and nothing is written. One that binds nothing and is
cheap to undo is still recorded, and the reply says it is below the decision floor.

`--answers <request-id>` links the decision to an open [`ask`](#ask) request, as
`--question <text>` would, without repeating the words.

### `emit decision.accepted`

```
loomtracer emit decision.accepted --decision-id <decision-id>
```

### `emit decision.rejected`

```
loomtracer emit decision.rejected --decision-id <decision-id>
```

### `emit decision.superseded`

```
loomtracer emit decision.superseded --old <decision-id> --new <new-decision-id>
```

Marks one existing decision as superseding another existing decision. Both
must already exist — this only records the relationship. To capture the new
decision and mark the supersession in one call, use [`supersede`](#supersede)
instead.

### `emit evidence.recorded`

```
loomtracer emit evidence.recorded --content <text> [--source-ref <ref>]
```

Records something observed as its own evidence node. To make a decision rest on
something observed in the same call, use `--rests-on-evidence` on the capture.

### `emit hypothesis.recorded`

```
loomtracer emit hypothesis.recorded --statement <text>
  [--kind <assumption|bet>]        # default: assumption
  [--check-by <date>] [--would-change-if <text>]
```

Records an assumption, or a declared bet, as its own node; decisions can rest on
it (`--hypotheses <id>`) and it can later be refuted.

### `emit ingest.batch_classified`

Keyless batch path: submit pre-classified captures from a plugin or edge session
directly — no `ANTHROPIC_API_KEY` needed. The server classifier skips this batch
because no companion `IngestBatchReceived` event exists for the batch ID.

```
loomtracer emit ingest.batch_classified
  --captures <path>              # JSON file: array of CaptureItem objects
  [--classifier-model <name>]    # default: claude-haiku-4-5-20251001
  [--schema-version <n>]         # must be "2"; default: 2
```

### `emit decision.scored`

Keyless assessment path: submit a model's assessment of one decision (schema
version 2) from a plugin or edge session directly — no `ANTHROPIC_API_KEY` needed.
Name the decision with `--decision-id` (one proposed directly), or with
`--batch-id` + `--capture-index` (one a classifier extracted in a prior
`ingest.batch_classified` batch). The JSON holds the seven dimensions under
`"dimensions"`, each `assessed` (a level, an explanation and a quote) or
`not_assessed` (and why), and goes through the same validator as the server's
own scorer.

```
loomtracer emit decision.scored
  (--decision-id <id> | --batch-id <id> --capture-index <n>)
  --scores <path>                  # JSON file: {"dimensions": {...}}
  --prompt-version <version>       # the prompt the model was given
  [--model <name>]                 # the model that produced the assessment
```

## Query commands

All `query` commands return JSON. They never write to the ledger.

### `query get_decision`

```
loomtracer query get_decision --id <decision-id>
```

Returns the full decision node with current derived status, supersession chain tip,
and `hypothesis_refuted` flag if any assumed hypothesis has been refuted.

### `query search_decisions`

```
loomtracer query search_decisions
  [--q <words>]            # every word must appear in the decision's text
  [--topic <key>]
  [--status <proposed|accepted|rejected|contested|superseded>]
  [--actor-id <actor-id,...>]
  [--since <duration>]     # e.g., 7d, 30d, 1h
  [--until <time>]
  [--limit <n>]            # default 25
  [--cursor <token>]       # next_cursor of the previous page
```

Alias: `search`.

To list all `contested` decisions (note: `disagree` is a top-level write command,
not a query subcommand):

```
loomtracer query search_decisions --status contested
```

### `query recall`

Layer-3 search + summarise in one call. Answers "what was decided about X?".

```
loomtracer query recall [<free-text query>]
  [--topic <key,...>]
  [--status <status,...>]
  [--since <duration>]
  [--limit <n>]          # default 5
```

### `query recent`

Alias of `recent_decisions`: the decisions decided in a time window.

```
loomtracer query recent
  --since <duration|date|timestamp>   # e.g., 7d, 2026-10-01
  [--until <time>]
  [--actor <pattern>]
  [--topic <key,...>]
  [--status <status,...>]
  [--limit <n>]
  [--cursor <token>]
```

To skip what you already reviewed, use [`review --unreviewed-only`](#review).

### `query get_supersession_chain`

Alias: `chain`.

```
loomtracer query get_supersession_chain (<free-text description> | --id <decision-id>)
  [--pick <n>]             # disambiguate when a description matches more than one decision
  [--topic <key>]          # narrow description resolution to this topic
```

Returns the full chain from the resolved decision back to the original proposal. A free-text
`<description>` resolves to a decision the same way `search`/`recall` do (deterministic term +
topic + recency ranking; see `docs/AGENT_FLUENT_QUERYING.md` in the repo for the full design); if
it matches more than one decision with no clear best match, the response is `{"outcome":
"ambiguous", "candidates": [...]}` instead — re-run with `--pick <n>`, a bare `#<n>` referring to
that candidate list, or `--id`. `--id` bypasses resolution entirely and is unchanged from before.

### `query compact-view`

Layer-3 signal/noise filter over a decision's subgraph.

```
loomtracer query compact-view (<free-text description> | --id <decision-id>)
  [--pick <n>]
  [--topic <key>]
```

Same fluent resolution as `get_supersession_chain` above.

### `query get_decision_neighborhood`

Alias: `why`.

```
loomtracer query get_decision_neighborhood (<free-text description> | --id <decision-id>)
  [--pick <n>]
  [--topic <key>]
  [--depth <n>]            # default 1
  [--relations <kind,...>]
  [--compact]              # return a compact-view instead of the raw neighborhood
```

Same fluent resolution as `get_supersession_chain` above.

### `query get_decision_outcome`

Alias: `verify`. "Did this decision hold up?" — leads with the decision, rationale, rejected
options, who decided, and whether it still holds (superseded / stale premises / contested),
plus the quality profile, composing `get_decision` + `get_decision_context` + `get_decision_outcome`
into one `DecisionBrief` answer. Distinct from the bulk `review` command below, which reports
across many decisions rather than answering this about one.

```
loomtracer query get_decision_outcome (<free-text description> | --id <decision-id>)
  [--pick <n>]
  [--topic <key>]
```

Same fluent resolution as `get_supersession_chain` above. IDs (`decision_id`, chosen/rejected
`option_id`) appear only as trailing handles for follow-up — never required reading to
understand the answer.

### `query get_relevant_decisions`

```
loomtracer query get_relevant_decisions --topic <key> [--status <status>]
```

### `query situational`

"What should I know before I touch this?" — decisions bearing on the working
situation, no id or hand-typed question needed. Matches by exact `topic_keys`
membership and by deterministic term overlap against evidence content; each
result surfaces `get_decision_outcome`'s `held_up`/`reasons` verbatim.

```
loomtracer query situational
  [--paths <file,dir,...>]     # defaults to the current git diff + staged set
  [--diff]                     # read a unified diff from stdin instead
  [--branch]                   # include the current branch name's tokens
  [--cwd]                      # include the current working directory's path segments
  [--since-offset <ledger-offset>]
  [--since-ts <timestamp>]
  [--since-branch-point]       # resolve --since to this branch's merge-base commit time
  [--base <ref>]               # base ref for --since-branch-point, default origin/master
  [--project <handle>]         # ask from this project instead of the whole tenant
  [--limit <n>]
```

With no flags at all, defaults to the current git diff/staged set in the
working directory — the "no question needed" mode. Requires a git repository
when relying on that default, `--branch`, or `--cwd`; pass `--paths`/`--diff`
explicitly otherwise.

`--project <handle>` (a registered handle or a personal address) asks from that
project: matches come from the project first, then the project it is part of
(inherited constraints), then the projects it depends on, each labelled, and the
answer says where it stopped. An unknown handle is refused. Without it the
whole tenant is searched.

### `query get_active_decision_blockers`

```
loomtracer query get_active_decision_blockers
  [--decision-id <id,...>]
  [--topic <key,...>]
  [--owner <actor-id,...>]
  [--blocked-actor <actor-id,...>]
  [--priority <level,...>]
  [--limit <n>]
```

### `query get_recent_activity`

```
loomtracer query get_recent_activity
  [--actor-id <id,...>]
  [--topic <key,...>]
  [--status <status,...>]
  [--limit <n>]
```

### `query get_decisions_changed_since`

```
loomtracer query get_decisions_changed_since
  [--since-offset <ledger-offset>]
  [--since-ts <timestamp>]
  [--until-offset <ledger-offset>]
  [--until-ts <timestamp>]
  [--limit <n>]
```

### `query get_decisions_added_since`

```
loomtracer query get_decisions_added_since
  [--since <duration>]
  [--since-offset <ledger-offset>]
  [--since-ts <timestamp>]
  [--limit <n>]
```

### `query export_read_only_summary`

```
loomtracer query export_read_only_summary
```

### `query score_decision`

The quality profile of one decision. No score, no tier.

```
loomtracer query score_decision --id <decision-id>
```

Returns seven dimensions (framing, alternatives, information, reasoning,
values_tradeoffs, bias_exposure, calibration), each `assessed` (a level of
`none`, `partial` or `solid`, with the reasons and the node ids behind it) or
`not_assessed` (and why), plus attention lines and provenance. Works
self-hosted, with no model.

### `query scan_decision_quality`

One page of attention findings: decisions that need a look, each with a stable
`finding_id`, the reason, the node ids and the dimensions it bears on.

```
loomtracer query scan_decision_quality
  [--kind <kind,...>]               # default: all kinds
  [--evidence-window-days <n>]      # evidence older than this counts as not re-checked; default 90
  [--limit <n>]                     # 1–1000, default 25
  [--cursor <token>]                # pagination cursor from a previous response
```

The kinds are `bet_past_check_date`, `premise_superseded`, `premise_rejected`,
`assumption_refuted`, `bet_failed`, `evidence_not_rechecked` and
`propagation_unfinished`. [`get_suggestions`](#query-get_suggestions) is the same
list without the findings someone has acknowledged.

### `query get_suggestions`

```
loomtracer query get_suggestions
  [--kind <kind,...>]
  [--evidence-window-days <n>]
  [--exclude-acknowledged <true|false>]   # default true
  [--limit <n>]
  [--cursor <token>]
```

The attention findings of `scan_decision_quality`, less the ones someone has
acknowledged: what is new since you last looked.

### `query rank_decisions_by_importance`

```
loomtracer query rank_decisions_by_importance
  [--include-not-in-force]          # also superseded and rejected decisions
  [--limit <n>]                     # 1–50, default 10
  [--cursor <token>]
```

Which decisions carry the most impact, most first, each with who decided it (a
person or an agent). A decision is ranked when other decisions follow from it;
the rest follow unranked and read `not_assessed`. No quality score, no composite.

### `query get_waiting_requests`

```
loomtracer query get_waiting_requests [--limit <n>] [--cursor <token>]
```

Questions asked with [`ask`](#ask) that no decision answers yet, oldest first:
what was asked, when, by whom, and the request id `emit decision.capture
--answers` takes.

### `query get_contested_decisions`

```
loomtracer query get_contested_decisions [--limit <n>] [--cursor <token>]
```

Decisions in contest, oldest first: one that an actor accepted and another
rejected (who is on each side), or accepted answers to one question that choose
different options.

### `query get_changed_decisions`

```
loomtracer query get_changed_decisions
  [--since <duration|date|timestamp>]   # default 7d
  [--until <time>]
  [--limit <n>]
  [--cursor <token>]
```

Decisions that were revised or superseded, or whose premise stopped standing, in
a window, most recently changed first: what changed, when, by whom and by what.

### `query get_open_why_decisions`

```
loomtracer query get_open_why_decisions [--limit <n>] [--cursor <token>]
```

Binding decisions whose why is still to answer, oldest first: decisions in force
that clear the decision floor and rest only on what their own capture brought,
each with what it rests on.

### `query scan_misfiled_decisions`

Flags decisions carrying a caller-named "foreign" topic key — a decision
tagged with another ledger's name most likely belongs there instead.
Deterministic exact-match only, no LLM: `loomtracer` does not yet know which
project a ledger belongs to, so the caller supplies the foreign keys.
Read-only report — never moves a decision.

```
loomtracer query scan_misfiled_decisions
  --foreign-topic <key>[,<key>...]  # required; repeatable or comma-separated
  [--limit <n>]                     # 1–1000, default 25
  [--cursor <token>]                # pagination cursor from a previous response
```

## Other commands

### `tenant create`

```
loomtracer tenant create <tenant-id>
```

Registers a tenant in the local SQLite ledger's tenant registry so it passes
the known-tenant check on later `--tenant <tenant-id>` opens. See
[Tenants](#tenants) above for the full contract, including the Postgres
provisioning route this command does not apply to.

### `project register` / `link` / `unlink` / `anchor` / `list` / `decisions` / `show` / `use`

```
loomtracer project register <handle> [--display-name <name>] [--purpose <text>]
loomtracer project link --from <handle> --to <handle> --kind <part_of|depends_on>
loomtracer project unlink --from <handle> --to <handle> --kind <part_of|depends_on>
loomtracer project anchor --handle <handle> --kind <folder|rig|jira|linear|github|channel> --value <value>
loomtracer project list [--limit <n>] [--cursor <cursor>]
loomtracer project decisions <handle> [--limit <n>] [--cursor <cursor>]
loomtracer project show <handle>
loomtracer project show --current
loomtracer project use <handle>
loomtracer project use --clear
```

Manage the project registry. See [Projects](#projects) above for the full
contract, including the `personal:<actor-id>` address, the `not_found`
envelope on `show`, and the actor-local `use`/`show --current`
current-project setting.

### `quickstart`

```
loomtracer --actor human:<id> quickstart
```

Creates an isolated temporary ledger, records a sample decision, queries it back,
and prints the result. No files are left behind.

### `review`

```
loomtracer --actor human:<id> review
  [--actor <pattern>]      # filter by actor (e.g., 'agent:*')
  [--since <duration>]
  [--unreviewed-only]
```

Interactive terminal review flow. See [Human Review](../../guides/human-review/).

### `mcp`

```
loomtracer mcp
  [--agent-tool <claude|codex|cursor|...>]   # who unnamed MCP writes are recorded as
  [--session-id <id>]
  [--project-from-context]                   # file unnamed captures by the folder's .loomtracer-project
```

Start the MCP stdio server. See [MCP Setup](../../guides/mcp-setup/).

### `dump`

```
loomtracer dump --format <dot|json>
```

Export the current projected graph as DOT (Graphviz) or JSON.

### `export`

```
loomtracer export --format markdown --out <dir>
  [--project <handle>]
  [--since <RFC3339>]
  [--topic <key,key,...>]
  [--status <status,status,...>]
```

Renders the decision log as a tree of Markdown files under `--out`, grouped per
project. Every decision belongs to exactly one project, so it is written exactly
once:

- `INDEX.md` — one section per project (a link to the project's own record and
  the table of its decisions, newest-first), so reading it top to bottom is the
  whole record.
- `projects/<handle>/INDEX.md` — one project's record on its own, and
  `projects/<handle>/decisions/*.md` — one file per matching decision.
- `projects/personal/<actor>/` — the same, for a personal project (derived from
  the recorder, never registered). The actor part is reduced to path-safe
  characters; two personal addresses that reduce to the same name each get a
  short hash of their full address appended, so they never share a directory.

Every registered project has a record, including one with no decisions yet
(`Counts: none.`); a personal project appears once it holds a decision. A
supersession between projects links across them.

`--project <handle>` writes only that project's files (a registered handle, or
a `personal:<actor>` address). An unknown handle writes nothing and reports
`outcome=not_found` — a successful envelope, never an empty tree that reads like
"that project has no decisions". `--format` accepts only `markdown` today.
`--since`, `--topic`, and `--status` narrow which decisions are included and are
ANDed together with `--project`.

`--out` is created if missing. The export **owns** `<out>/INDEX.md` and every
`.md` file under `<out>/projects/` (plus any left in `<out>/decisions/` by the
flat layout used before decisions were grouped per project): any such file this
run did not produce is removed, and directories that empties go with it, so a
narrower filter or a compacted ledger never leaves stale files behind. A
`--project` run therefore leaves only that project under `projects/`, so give
each project's record its own `--out`. Nothing else under `--out` is touched. `--out`
pointing at an existing file fails before any write.

Every byte is derived from the graph (ledger timestamps, immutable ids and
titles, derived status) — re-running with an unchanged ledger and the same
filters produces a byte-identical tree. Not an MCP tool: the intended
consumer is a scheduled CLI run that commits the tree to a repo, which has
no use for a directory tree returned as one JSON payload.

Prints a one-line summary (`out_dir=... ledger_offset=... files_written=...
files_removed=...`) or, with `--json`, the same fields as a JSON object tagged
`"outcome": "exported"`. An unknown `--project` prints
`outcome=not_found project=<handle>` (JSON: `{"outcome":"not_found","project":"<handle>"}`).

### `import documents`

```
loomtracer --actor <id> import documents [--file <path> | <directory>]
  [--on-conflict <keep_existing|supersede|contest|add_context>]
  [--extractor-command <command>]
  [--extractor-arg <arg>]
  [--llm-response <path>]
  [--json]
```

Import decisions from markdown or text files. All imported decisions land in
the ledger immediately as **unreviewed** (proposed, not auto-accepted) and flow
into the review step (`loomtracer review --unreviewed-only`).

Auto-detection: if a file contains explicit `Decision:` blocks, the
deterministic block parser runs. If it does not, the file is treated as prose
and the extractor configured via `--extractor-command` (or a pre-computed
`--llm-response`) is used to extract candidate decisions. Prose extraction
requires one of those two flags; without them a prose file produces no output.

Re-importing identical input is a no-op. Changed same-id re-imports report
conflicts by default; resolve with `--on-conflict`.

### `tui`

```
loomtracer tui [--q <query>] [--topic <key>] [--status <status>] [--dot-output <path>]
```

Read-only terminal UI for decision search and graph navigation.
Requires build with `--features tui`.

### `supersede`

```
loomtracer --actor <id> supersede [<description>]
  [--old <decision-id>]
  [--pick <n>]
  [--topic <topic-key>]
  --title <text>
  --rationale <text>
  [--topic-keys <key,key,...>]
  [--options <opt,opt,...>]
  [--chose <option>]
  [--hypotheses <id,id,...>]
  [--evidence <id,id,...>]
  [--project <handle>]
  [--project-source <stated|folder_marker|rig|current_project|job>]
  [--rests-on-decision <description|#N|decision-id>]...
  [--rests-on-evidence <what was observed>]... [--evidence-source <where>]...
  [--rests-on-assumption <statement>]...
  [--bet [<statement>]] [--would-change-if <text>] [--check-by <date>]
  [--confidence <low|medium|high>]
  (--binds <what> | --binds-nothing)
  (--undo-cost <what> | --cheap-to-undo)
```

Captures a new decision and marks it as superseding an existing one in a
single call — the write path for "this reverses an earlier decision."
Resolve the decision being superseded either with `--old <decision-id>` or a
free-text `<description>` fragment (narrow candidates first with `--topic`);
an ambiguous description short-circuits without writing and returns numbered
candidates to disambiguate with `--pick <n>`. Retrying with the same resolved
old decision and the same new-decision fields is idempotent — it returns the
same `new_decision_id` and appends no new ledger events.

Prints `old_decision_id`, `new_decision_id`, `old_decision_status` (now
`superseded`), `new_decision_status`, and the `project` and `project_source`
the new decision was filed under. Add `--json` for the structured form, which
also carries `project_notice` on the personal fallback.

Without `--project` the new decision inherits the old decision's project and how
it was determined; `--project <handle>` (a registered project, with an optional
`--project-source`) files it elsewhere, exactly as on
[`emit decision.proposed`](#emit-decisionproposed). In text mode the same
`project: ...` line goes to stderr.

The replacement must say what it rests on, what it binds and what undoing it
would cost, with the same flags and the same refusal as
[`emit decision.capture`](#emit-decisioncapture); nothing is written, and the old decision is not resolved, when none is given. A premise
that is already superseded or rejected adds ` premise_stale=<ids>` to the text
output.

### `move`

```
loomtracer --actor <id> move [<description>]
  [--decision <decision-id>]
  [--pick <n>]
  [--topic <topic-key>]
  --to <handle|personal:<actor>>
  [--reason <text>]
```

Moves a decision to another project. Name the decision with a free-text
`<description>` or `--decision <decision-id>`; narrow candidates first with
`--topic`. A description that matches more than one decision lists numbered
candidates and writes nothing — choose one with `--pick <n>` (or `#N` as the
description). One that matches nothing is a successful `not_found` answer.

`--to` is a registered project handle, or your own personal address. Where the
decision is now is read from the ledger, never typed. The move is recorded with
who, when, from, to and `--reason`, and shows in the decision's history. It is
reversible: moving the decision back is another recorded move, and nothing is
deleted or rewritten.

Prints `event_id=... decision_id=... from=... to=...`; `--json` gives the same
fields as an object.

### `disagree`

```
loomtracer --actor <id> disagree [<description>]
  [--decision <decision-id>]
  [--pick <n>]
  [--topic <topic-key>]
  --reason <text>
```

Records that you disagree with a decision, and why. Your rejection is kept beside
everyone else's position, never overwriting it: a decision one actor accepted and
another rejected reads `contested`. To change a decision you accepted yourself,
use [`supersede`](#supersede). See [Human Review](../../guides/human-review/).

### `retitle`

```
loomtracer --actor <id> retitle [<description>]
  [--decision <decision-id>]
  [--pick <n>]
  [--topic <topic-key>]
  --to <new title>
  [--reason <text>]
```

Renames a decision. The old title is kept on the node (`former_title`) and in the
untouched `decision.proposed` event; nothing is lost. Recorded with who, when,
from, to and why; reversed by retitling it back.

### `ground`

```
loomtracer --actor <id> ground [<description>]
  [--id <decision-id>]
  [--pick <n>]
  [--topic <topic-key>]
  [--rests-on-decision <description|#N|decision-id>]...
  [--rests-on-evidence <what was observed>]... [--evidence-source <where>]...
  [--rests-on-assumption <statement>]...
  [--bet [<statement>]] [--would-change-if <text>] [--check-by <date>]
  [--evidence <id,...>] [--hypotheses <id,...>]
  [--answers <question>]
```

Says what an existing decision rests on, after the fact, so an older decision
stops reading "nothing declared" without pretending the grounding was there at
capture. Append-only and recorded as whoever runs it. Nothing is written when the
description is ambiguous, a premise cannot be pinned to one decision, or a
premise would close a loop.

### `reexamine`

```
loomtracer reexamine
  [--decision <description> | --id <decision-id>] [--pick <n>]
  [--project <handle>]
  [--all]                  # closed items too
  [--limit <n>] [--cursor <token>]
```

Lists the decisions that rest on something that changed and have not been looked
at again: the open re-examine items, oldest decision first. Each names the
decision, the premise that changed, how (superseded, rejected, contested or
refuted) and when. `--all` adds the closed ones, with who reaffirmed them and why.

### `reaffirm`

```
loomtracer --actor <id> reaffirm [<description>]
  [--id <decision-id>]
  [--pick <n>]
  [--topic <topic-key>]
  [--premise <id or words>]   # needed only when the decision has several open items
  --because <text>
```

Says that a decision still holds after something it rests on changed: closes its
open re-examine item with a one-line reason, recorded with who you are and when.

### `ask`

```
loomtracer --actor <id> ask "<the question, in one line>"
```

Records that you are asking a question before any decision answers it. The request
waits until a decision answers it (`emit decision.capture --answers <request-id>`);
[`query get_waiting_requests`](#query-get_waiting_requests) lists the open ones.
The same question can be asked more than once, each its own request.

### `restatements`

```
loomtracer restatements propose [--project <address>]
loomtracer --actor <id> restatements apply (--all | --link <later-id>=<earlier-id>...)
  [--project <address>]
```

Finds decisions that were recorded more than once. `propose` lists the decisions
whose titles look like one already recorded, with the words they share, and writes
nothing. `apply` records the links you approve. A link is never a merge: both
records stay, and `recall` and `why` show them as one decision.

### `digest`

```
loomtracer digest
  [--window <Nd|Nh|Nw>]    # default 7d
  [--since <time>] [--until <time>]
  [--actor <actor-id,...>]
  [--limit <n>] [--cursor <token>]
  [--summary]
```

"What did we decide this week, and why?" for a time window, from the graph. JSON
by default; `--summary` for readable prose.

### `map`

```
loomtracer map [--alpha <0.0..1.0>] [--summary]
```

Computes a 2-D map of the decisions (x = time, y = meaning) and prints it as a JSON
point set. `--alpha` blends meaning (0.0) with supersession structure (1.0).

### `serve`

```
loomtracer serve
  [--bind <address>]                # default 127.0.0.1
  [-p, --port <n>]                  # default 8080
  [--allow-unauthenticated-remote]
```

Starts the HTTP API server, with `/mcp`. The bearer token is read from
`LOOMTRACER_API_KEY`; without it the server runs in development mode with no
authentication, which is refused on a non-loopback `--bind` unless
`--allow-unauthenticated-remote` is passed. See the
[Quickstart](../../getting-started/quickstart/#run-a-cell-with-docker) for a cell
with Postgres.

### `migrate`

```
loomtracer migrate --to-tenant <tenant>
  (--to-url <cell url> --admin-key-file <path> | --to <postgres url>)
  [--from <sqlite dir>]    # default: --loomtracer-dir
  [--dry-run]
```

Moves a local SQLite ledger into a shared cell, event for event. Each event keeps
its id, actor, source and time; an event the destination already holds is skipped,
so a re-run writes nothing. `--to-url` sends the events over HTTP with the cell's
admin key; `--to` writes straight to Postgres. `--dry-run` writes nothing and prints
what would move.

### `classify-queue`

```
loomtracer classify-queue list [--limit <n>] [--session-id <id>]
loomtracer classify-queue submit --batch-id <id,...> --captures <path> [--model <name>]
```

Inspects and drains the classification queue on your own subscription: `list` shows
the batches still to classify, `submit` writes the captures your agent produced for
them. See [Agent Capture](../../guides/agent-capture/).

### `ingest`

```
loomtracer ingest slack-thread --file <export.json> [--mention <@bot>]
```

Turns an exported Slack thread into a proposed decision: records the decision its
messages spell out, nothing summarized or inferred. The thread must mention the bot
(default `@loomtracer`); a thread already ingested returns the existing decision id.

### `slack-app`

```
loomtracer slack-app manifest --request-url <url>
loomtracer slack-app oauth-url --client-id <id> --redirect-uri <uri> --state <state>
loomtracer slack-app install --team-id <id> --team-name <name> --bot-token <token> --signing-secret <secret>
loomtracer slack-app enqueue-capture --team-id <id> --user-id <id> --channel-id <id> --message-ts <ts> \
  --permalink <url> --surface <surface> --title <text> --rationale <text>
loomtracer slack-app drain
loomtracer slack-app command --team-id <id> --user-id <id> --text <text>
```

Runs the Slack integration's pieces by hand: print the app manifest, build the OAuth
install URL, store a workspace install, queue and write thread captures (each into
its workspace's own tenant), and answer `/loomtracer` slash commands.

### `connector`

```
loomtracer connector auth gdocs
```

Signs in to a connector (today only Google Docs) for
`import connector run --url <doc>`; it opens a browser for OAuth consent. Set
`LOOMTRACER_GOOGLE_CLIENT_ID` and `LOOMTRACER_GOOGLE_CLIENT_SECRET` first.

### `quality-scan`

```
loomtracer --actor <id> quality-scan
  [--kind <kind,...>]
  [--limit <n>]                       # 1–50 tickets per run
  [--linear-team-id <id>]             # overrides LOOMTRACER_LINEAR_TEAM_ID
  [--loomtracer-base-url <url>]       # overrides LOOMTRACER_PUBLIC_URL
  [--dry-run]
```

Files a Linear ticket for each attention finding nobody has acknowledged (the
findings of [`get_suggestions`](#query-get_suggestions)) and acknowledges each one
it files, so running it again files only what is new. Set
`LOOMTRACER_LINEAR_API_KEY` and `LOOMTRACER_LINEAR_TEAM_ID` first; `--dry-run`
calls nothing and acknowledges nothing.

## Environment variables

| Variable | Description |
|----------|-------------|
| `LOOMTRACER_DIR` | Default ledger directory |
| `LOOMTRACER_TENANT` | Default tenant (default: `local`). Overridden by `--tenant`. Must be a known tenant — see [Tenants](#tenants). |
| `LOOMTRACER_DATABASE_URL` | Shared Postgres backend connection URL. Unset or empty selects the local SQLite ledger. Overridden by `--database-url`. Requires the `shared-backend-postgres` feature. |
| `LOOMTRACER_ACTOR` | Default actor if `--actor` is omitted |
| `LOOMTRACER_GRAPH_BACKEND` | Graph backend: `memory` (default) or `kuzu` |
| `LOOMTRACER_VERSION` | Pin version for the installer script |
| `LOOMTRACER_INSTALL_DIR` | Install destination for the installer script |
