---
title: MCP Tools
description: Reference for all 40 tools exposed by the Loomtracer MCP server.
---

The Loomtracer MCP server exposes 40 tools. Write tools append events to the
ledger and require an explicit `actor_id`. Read tools query the graph and never
write. Layer-3 tools add ranked summaries or compact views.

The Markdown decision-log export (`loomtracer export --format markdown --out <dir>`) is
CLI-only and has no MCP tool: its output is a directory tree, not a single result an
MCP call can return.

See [MCP Setup](../../guides/mcp-setup/) to configure your client.

---

## Write tools

### `capture_decision`

Record a decision with rationale, topic keys, at least one option, what it rests on (`grounding`, required), and what it binds and what undoing it would cost (`binds` and `undo_cost`, both required). Defaults actor_id to agent:<tool>:<name> (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`) and writes source=agent. A `chosen_option_label` means the decision was already made: it self-accepts from `actor_id` by default, or from `decided_by` when the decider differs (e.g. a human decided, an agent is scribing it); pass `delegated_by` when an agent decided for itself within a scope a human delegated. Pass `still_proposed` to keep a genuine open recommendation at `proposed` instead. When your rationale or question names an earlier decision (its id or its title), put that decision in `grounding` as `{kind:"decision"}`: it is what this one follows from, and prose alone records no link (look it up first with `recall_decisions` if you only know the title). When what you rest on is a person's ruling, record the ruling as that person's decision (`decided_by` them, their words in `quote` with `question`) and ground yours on it; never put it in `grounding` as your `evidence`. The reply lists `floor` (`{binds, undo_cost, cleared}`: your two answers and whether they clear the decision floor, which they do when the decision binds something or is costly to undo; a decision that does neither is still recorded and the reply adds `below_floor: true` with a note), `rests_on` (what was recorded), `premise_stale` (named decisions already superseded or rejected) and, only when present, `cited_not_linked`: decisions whose id your rationale names but the grounding does not list. It is a hint, the capture is recorded either way; if yours follows from one, add it with `ground_decision`. Also only when present, `warnings`: one entry (`kind`, `option_label`, `suggestion`, `message`) for each option label that looks like a slug (`direct-cli`); the capture is recorded with the label as sent, and `suggestion` is the words to write instead (`Direct CLI`).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `binds` | object | ✓ | Required. Does this decision bind anything beyond the edit in front of you (other people, other code, a later choice)? `{level: "nothing"}`, or `{level: "something", statement}` saying what. A capture that leaves it out is refused and nothing is written. |
| `grounding` | any[] | ✓ | What this decision rests on — required, at least one item. Four ways to answer: a decision we already made (`{kind:"decision", description}` — name it the way you would describe it — or `{kind:"decision", decision_id}` when you hold the id of a decision you consulted), something observed (`{kind:"evidence", content, source?}` — the observation and where: URL, file@commit, test run, measurement), something assumed (`{kind:"assumption", statement}`), or nothing yet (`{kind:"bet", statement?, would_change_if?, check_by?}` — a declared bet). An existing node can be named by id: `{kind:"evidence", evidence_id}` / `{kind:"assumption", hypothesis_id}`. The decider's own words are not a grounding; they go in `quote`. A `description` that matches more than one decision returns a successful result shaped `{outcome: "ambiguous", field: "grounding[i]", candidates: [...]}`, and one that matches none returns `{outcome: "not_found", field: "grounding[i]", description}`; in both cases NO event is appended — re-call with that item's `decision_id`. A capture that names nothing is refused. |
| `options` | object[] | ✓ |  |
| `rationale` | string | ✓ | Self-contained why, readable without the source conversation: at least 20 characters and 4 words, and not a bare reference into an external numbered list like "1a" or "2. a" — pair `quote` with `question` instead of embedding one. |
| `title` | string | ✓ | A name, not a summary: one sentence, at most 120 characters. Longer reasoning goes in `rationale`. |
| `topic_keys` | string[] | ✓ |  |
| `undo_cost` | object | ✓ | Required. What would undoing this decision cost? `{level: "cheap"}`, or `{level: "costly", statement}` saying what. A capture that leaves it out is refused and nothing is written. A decision that binds nothing and is cheap to undo is still recorded; the reply marks it `below_floor`. |
| `actor_id` | string | — | Optional capturing actor override. Defaults to `agent:<tool>:<name>` (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `answers` | string | — | The id of an existing `request_decision` request this decision answers (its `request_id`): resolves to that request's question and links this decision to it, exactly as `question` would, without repeating the words. Refused when the request does not exist, or together with `question`. Distinct from `ground_decision`'s `answers`, which takes the question's own text, not a request id. |
| `chosen_option_label` | string | — | Label of the option that was accepted; must match one of `options[].label`. Setting this means the decision was already made — see `still_proposed` to keep it open instead. |
| `decided_by` | string | — | Actor who actually made the decision, when it differs from `actor_id` (the recording actor/scribe) — e.g. `human:alex@example.com` when an agent is writing down a decision a human made. Requires `chosen_option_label`. Mutually exclusive with `still_proposed`. |
| `declare_topics` | string[] | — | Topic keys from `topic_keys` that this call adds to the project's topic vocabulary. A call filed under a registered project may only use topic keys that project already declared (a personal project has no vocabulary), so name a new key here; the reply lists `declared_topics`. Each must be one of this call's topic keys. |
| `delegated_by` | string | — | The human (`human:<name>`) whose delegated scope this decision falls within, when `actor_id` (an agent) decided it for itself — the self-acceptance carries the marker, so an agent deciding under a delegation is distinguishable from one deciding alone (no marker). Requires `chosen_option_label`. Mutually exclusive with `still_proposed`; conflicts with a `decided_by` other than `actor_id`. A standing delegation is the same value repeated on each capture in that scope. |
| `evidence_ids` | string[] | — | Deprecated alias: ids listed here count as `{kind:"evidence", evidence_id}` grounding items. |
| `expressed_confidence` | string | — | Confidence in the decider's own words. Omit when they expressed none; never estimate it. |
| `hypothesis_ids` | string[] | — | Deprecated alias: ids listed here count as `{kind:"assumption", hypothesis_id}` grounding items. |
| `project` | string | — | Registered project handle to file the decision under. An unknown handle is refused with the register command. Omit it and the decision is saved to the actor's personal project — the reply says so (`project_notice`). Loomtracer checks the handle and never works out the project itself, so pass it whenever you know it; an HTTP-served MCP cannot see the caller's working directory. A stdio server started with `--project-from-context` works it out from its own working directory when you omit it (the `.loomtracer-project` files of the folders the uncommitted change touches, else the nearest one above the working directory, then the rig, then the actor's current project; `project_source` says which), and adds `project_reminder` when the folder is not attached to any project or the change spans several: several projects are recorded for the nearest project they are all part of, or saved to the personal project when they share none. |
| `project_source` | string | — | How `project` was determined. Defaults to `stated`. Requires `project`. |
| `question` | string | — | The question this decision answers, in the capturer's own words: one line. Required when `quote` is given; otherwise optional. Two captures whose question is the same after lowercasing, collapsing spaces and dropping trailing punctuation share one question node, so a decision that answers the same question again, or one that answers it differently, is findable. The reply's `question_id` names the node. |
| `quote` | string | — | Verbatim words of the decider, self-contained — not a bare reference like "1a" into an external numbered list. Requires `question`. A quote with no stated question is unreadable once the source conversation is gone. |
| `still_proposed` | boolean | — | Keep the decision at `proposed` even though `chosen_option_label` is set, for a genuine open recommendation awaiting someone else's decision. Defaults to false, which self-accepts (or accepts from `decided_by`) immediately after proposing. |

---

### `capture_evidence`

Record an evidence item that can be attached to decisions or hypotheses. Defaults actor_id to agent:<tool>:<name> (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`) and writes source=agent.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | ✓ |  |
| `actor_id` | string | — | Optional capturing actor override. Defaults to `agent:<tool>:<name>` (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |

---

### `capture_hypothesis`

Record a hypothesis. Defaults actor_id to agent:<tool>:<name> (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`) and writes source=agent.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `statement` | string | ✓ |  |
| `actor_id` | string | — | Optional capturing actor override. Defaults to `agent:<tool>:<name>` (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |

---

### `disagree_decision`

Record an actor disagreement with a decision and return the resulting derived status. Resolves by decision_id or a free-text description — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error, and no event is appended; re-call with decision_id from that list. The same shape is returned when no decision contains every word but some contain most of them: each such close candidate lists the words it lacks in `missing_terms`, and none is picked for you. A description matching nothing is also a successful result, shaped `{outcome: "not_found"}`, and no event is appended. The reply also lists what the decision rests on, so the disagreement can be taken upstream when it is really with a premise: `rests_on` (each thing it rests on with its standing, and for a prior decision `dependents_count`, how many decisions rest on it) and `raise_upstream` (the prior decisions it rests on that still stand, each `{premise_id, label, other_dependents}`; empty when there is nothing to raise). It is a hint and changes nothing: your disagreement is recorded on this decision either way; if it is with a premise, call `disagree_decision` or `supersede_decision` on that premise as well. Look at what a decision rests on (`get_decision_outcome`) before you disagree with it. Wraps `loomtracer disagree`.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reason` | string | ✓ |  |
| `actor_id` | string | — | Disagreeing actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `decision_id` | string | — | The decision to disagree with. Provide this or `description`, not both. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `supersede_decision`

Propose a replacement decision that says what it rests on (`grounding`, required) and what it binds and what undoing it would cost (`binds` and `undo_cost`, both required), and mark it as superseding an old decision. Wraps `loomtracer supersede`. Resolves the old decision by `old_decision_id` or a free-text `description` (+ optional `topic`) — exactly one of `old_decision_id`/`description` is required, the same fluent resolution `get_decision_neighborhood` uses. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error, with no write; re-call with `old_decision_id` from that list. The same shape is returned when no decision contains every word but some contain most of them: each such close candidate lists the words it lacks in `missing_terms`, and none is picked for you. A description matching nothing is also a successful result, shaped `{outcome: "not_found"}`, also with no write. The reply's `rests_on` is what the replacement rests on; its `raise_upstream` lists the prior decisions the replaced decision rests on that still stand, each `{premise_id, label, other_dependents}` (empty when there is nothing to raise). It is a hint and changes nothing: the replacement is recorded either way; if the problem is with a premise, call `disagree_decision` or `supersede_decision` on that premise as well. Look at what a decision rests on (`get_decision_outcome`) before you replace it. Only when present, `warnings`: one entry (`kind`, `option_label`, `suggestion`, `message`) for each option label that looks like a slug (`direct-cli`); the replacement is recorded with the label as sent, and `suggestion` is the words to write instead (`Direct CLI`).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `binds` | object | ✓ | Required. Does this decision bind anything beyond the edit in front of you (other people, other code, a later choice)? `{level: "nothing"}`, or `{level: "something", statement}` saying what. A capture that leaves it out is refused and nothing is written. |
| `grounding` | any[] | ✓ | What this decision rests on — required, at least one item. Four ways to answer: a decision we already made (`{kind:"decision", description}` — name it the way you would describe it — or `{kind:"decision", decision_id}` when you hold the id of a decision you consulted), something observed (`{kind:"evidence", content, source?}` — the observation and where: URL, file@commit, test run, measurement), something assumed (`{kind:"assumption", statement}`), or nothing yet (`{kind:"bet", statement?, would_change_if?, check_by?}` — a declared bet). An existing node can be named by id: `{kind:"evidence", evidence_id}` / `{kind:"assumption", hypothesis_id}`. The decider's own words are not a grounding; they go in `quote`. A `description` that matches more than one decision returns a successful result shaped `{outcome: "ambiguous", field: "grounding[i]", candidates: [...]}`, and one that matches none returns `{outcome: "not_found", field: "grounding[i]", description}`; in both cases NO event is appended — re-call with that item's `decision_id`. A capture that names nothing is refused. |
| `rationale` | string | ✓ | Self-contained why, readable without the source conversation: at least 20 characters and 4 words, and not a bare reference into an external numbered list like "1a" or "2. a". |
| `title` | string | ✓ | A name, not a summary: one sentence, at most 120 characters. Longer reasoning goes in `rationale`. |
| `undo_cost` | object | ✓ | Required. What would undoing this decision cost? `{level: "cheap"}`, or `{level: "costly", statement}` saying what. A capture that leaves it out is refused and nothing is written. A decision that binds nothing and is cheap to undo is still recorded; the reply marks it `below_floor`. |
| `actor_id` | string | — | Superseding actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `chosen_option_label` | string | — | Label of the option the replacement chose; must match one of `options`. Setting this means the decision was already made: the replacement self-accepts from `actor_id` — see `still_proposed` to keep it open instead. |
| `declare_topics` | string[] | — | Topic keys from `topic_keys` that this call adds to the project's topic vocabulary. A call filed under a registered project may only use topic keys that project already declared (a personal project has no vocabulary), so name a new key here; the reply lists `declared_topics`. Each must be one of this call's topic keys. |
| `description` | string | — | Free-text match for the decision to supersede. Required when `old_decision_id` is omitted. |
| `evidence_ids` | string[] | — | Deprecated alias: ids listed here count as `{kind:"evidence", evidence_id}` grounding items. |
| `expressed_confidence` | string | — | Confidence in the decider's own words. Omit when they expressed none; never estimate it. |
| `hypothesis_ids` | string[] | — | Deprecated alias: ids listed here count as `{kind:"assumption", hypothesis_id}` grounding items. |
| `old_decision_id` | string | — |  |
| `options` | any[] | — |  |
| `project` | string | — | Registered project handle to file the superseding decision under. An unknown handle is refused with the register command. Omit it and the new decision inherits the project the old decision is filed in now (after a move, the project it was moved to) and `project_source` reads `inherited`; a decision in a personal project is replaced into the recording actor's own personal project. Loomtracer never works out the project itself; an HTTP-served MCP cannot see the caller's working directory. A stdio server started with `--project-from-context` works it out from its own working directory when you omit it, and inherits only when that finds nothing. |
| `project_source` | string | — | How `project` was determined. Defaults to `stated`. Requires `project`. |
| `still_proposed` | boolean | — | Keep the replacement at `proposed` even though `chosen_option_label` is set, for a genuine open recommendation awaiting someone else's decision. Defaults to false, which self-accepts immediately after recording the supersession. |
| `topic` | string | — | Optional topic_key filter narrowing the `description` match. |
| `topic_keys` | string[] | — |  |

---

### `link_supersession`

Record that one decision that is ALREADY recorded replaces another, creating neither. Use it when the replacement was captured on its own, with its real decider (a person's own answer, captured with `decided_by`): the replacement keeps that decider. `supersede_decision` instead records a NEW replacement decided by the calling actor, so it would put the caller's name on the person's answer. Capture the replacement first, then link. Appends one `decision.superseded` attributed to `actor_id`: it says who linked the two, not who decided. Nothing is deleted or rewritten; afterwards the old decision reads `superseded` in `get_decision` and `why`, and `get_supersession_chain` walks from it to the new one. Both ids must be recorded decisions, named by id (no description lookup). Refused as an invalid argument, with nothing written: an id that is not a recorded decision, the same id twice, and a link that would close a loop of replacements (the old decision already replaces the new one, directly or through others). A pair already linked, directly or through other replacements, writes nothing: the reply says `linked: false` and lists the ids from the new decision down to the old one in `already_linked_through`, so a retry after a timeout is safe. The reply is `{old_decision_id, new_decision_id, linked, event_id, already_linked_through?}`. The CLI's `emit decision.superseded --old <id> --new <id>` appends the same event, but only to a local ledger and without the loop and already-linked checks.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `new_decision_id` | string | ✓ | The recorded decision that replaces it. It must already exist; this call does not create it and does not change who decided it. |
| `old_decision_id` | string | ✓ | The recorded decision that is replaced. `supersede_decision` names its old decision `old_decision_id` too. |
| `actor_id` | string | — | The actor who links the two decisions. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |

---

### `move_decision`

Move a decision to another project, recorded with who, when, from, to and why. Reversible: moving it back is another recorded move; nothing is deleted or rewritten. Resolves by decision_id or a free-text description — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error, and no event is appended; re-call with decision_id from that list. The same shape is returned when no decision contains every word but some contain most of them: each such close candidate lists the words it lacks in `missing_terms`, and none is picked for you. A description matching nothing is also a successful result, shaped `{outcome: "not_found"}`, and no event is appended. On success the reply is `{decision_id, event_id, from, to, reason?}`, where `from` is the project the decision was in, read from the ledger. `to` must be a registered project handle or the acting actor's own personal address (`personal:<actor>`); an unknown handle is refused with the register command, and a decision already in `to` is refused. Wraps `loomtracer move`.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | ✓ | Project to move the decision to: a registered handle, or the acting actor's own personal address. Where the decision is now is read from the ledger, never passed. |
| `actor_id` | string | — | Moving actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `decision_id` | string | — | The decision to move. Provide this or `description`, not both. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `reason` | string | — | Why the decision belongs in `to`; kept with the move and shown in the decision's history. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `retitle_decision`

Rename a decision, recorded with who, when, from, to and why. Reversible: retitling it back is another recorded retitle; nothing is deleted or rewritten — the old title stays readable as `former_title` on the node and in the untouched decision.proposed event. Resolves by decision_id or a free-text description — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error, and no event is appended; re-call with decision_id from that list. The same shape is returned when no decision contains every word but some contain most of them: each such close candidate lists the words it lacks in `missing_terms`, and none is picked for you. A description matching nothing is also a successful result, shaped `{outcome: "not_found"}`, and no event is appended. On success the reply is `{decision_id, event_id, from, to, reason?}`, where `from` is the decision's title before this call, read from the ledger. `to` must pass the same title rules decision capture enforces (a short name, one sentence, no numbered list); a decision already titled `to` is refused. Wraps `loomtracer retitle`.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | ✓ | The new title: a short name, not a paragraph. What it is now is read from the ledger, never passed. |
| `actor_id` | string | — | Retitling actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `decision_id` | string | — | The decision to retitle. Provide this or `description`, not both. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `reason` | string | — | Why the decision was renamed; kept with the retitle and shown in the decision's history. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `acknowledge_suggestion`

Record that a finding from get_suggestions has been looked at, so get_suggestions stops returning it. Appends two attributed, append-only events: suggestion.surfaced (this finding, shown to `actor_id`, over `channel`) and the notification.acknowledged that names it, carrying `action`. Nothing is deleted or rewritten, and nothing is checked against the scan: the finding is identified by `finding_id` alone, so an id nothing currently reports acknowledges nothing. A finding whose basis later changes gets a new finding_id and is returned again. Acknowledgement is per finding, not per actor: once anyone has acknowledged it, get_suggestions leaves it out for everyone unless exclude_acknowledged is false. Read `finding_id` and `decision_id` off the finding. The reply is `{finding_id, decision_id, action, notification_id, surfaced_event_id, acknowledged_event_id}`. No LLM involved; works self-hosted.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | ✓ | The finding's `decision_id`. |
| `finding_id` | string | ✓ | The finding's `finding_id`, exactly as get_suggestions returned it. |
| `action` | string | — | What was done with it: `seen` (looked at, nothing more claimed; the default), `acted` (dealt with) or `dismissed` (set aside on purpose). Every action hides the finding from get_suggestions; the ledger keeps which. |
| `actor_id` | string | — | Acknowledging actor, who the finding is recorded as surfaced to. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `channel` | string | — | A label for where the finding was shown; Loomtracer attaches no meaning to it. Defaults to `mcp`. |

---

### `ground_decision`

Record what an existing decision rests on, after the fact — for a decision captured without saying (older decisions read `nothing declared`) or one whose premises came to light later. Append-only, and attributed to `actor_id` (the grounder, not the decision's proposer), so a reader sees it was added later rather than at capture. Wraps `loomtracer ground`. Resolves the decision by `decision_id` or a free-text `description` (+ optional `topic`) — exactly one is required, the same fluent resolution `supersede_decision` uses. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error, with no write; re-call with `decision_id` from that list. A description matching nothing is also a successful result, shaped `{outcome: "not_found"}`, also with no write. `grounding` names what it rests on (required unless `answers` is given). `answers` names the question this decision answers (a decision captured without one); the reply's `answers` gives the question node's id. The reply lists `rests_on` (what was recorded) and `premise_stale` (named decisions already superseded or rejected). To check whether a bet held, record evidence and relate it with `emit evidence.recorded` + `relation.added` SUPPORTS|REFUTES.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actor_id` | string | — | Grounding actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `answers` | string | — | The question this decision answers, for a decision captured without saying: links it to the question node whose text matches (lowercase, spaces collapsed, trailing punctuation dropped), creating the node if none does. Attributed to `actor_id`, so a reader sees it was added later. A decision answers one question: naming a different one than it already answers is refused. May stand alone; then `grounding` is optional. |
| `decision_id` | string | — | The decision to ground. Provide this or `description`, not both. |
| `description` | string | — | Free-text match for the decision to ground. Required when `decision_id` is omitted. |
| `grounding` | any[] | — | What the decision rests on — at least one item unless `answers` is given. Four ways to answer: a decision we already made (`{kind:"decision", description}` — name it the way you would describe it — or `{kind:"decision", decision_id}` when you hold the id), something observed (`{kind:"evidence", content, source?}` — the observation and where: URL, file@commit, test run, measurement), something assumed (`{kind:"assumption", statement}`), or nothing yet (`{kind:"bet", statement?, would_change_if?, check_by?}` — a declared bet). An existing node can be named by id: `{kind:"evidence", evidence_id}` / `{kind:"assumption", hypothesis_id}`. The decider's own words are not a grounding. A `description` that matches more than one decision returns a successful result shaped `{outcome: "ambiguous", field: "grounding[i]", candidates: [...]}`, and one that matches none returns `{outcome: "not_found", field: "grounding[i]", description}`; in both cases NO event is appended — re-call with that item's `decision_id`. A decision that already rests, directly or through others, on the decision being grounded cannot be its premise: that is refused as an error and nothing is written. |
| `topic` | string | — | Optional topic_key filter narrowing the `description` match. |

---

### `reaffirm_decision`

Say that a decision still holds after something it rests on changed — close its open re-examine item. Wraps `loomtracer reaffirm`. When a premise a decision rests on is superseded, rejected, contested or refuted, the decision gets an open item (`get_reexamine_items` lists them); looking again and finding it still holds is recorded here with a one-line `reason`, attributed to `actor_id`, and the item closes. Reaffirmation is a statement of fact, not a verdict on anyone: it is also how an agent says a dependent still holds. A premise that changes again after a reaffirmation reopens the item and needs another one. Only an open item can be closed: the call is refused as an error, with nothing written, when the decision does not rest on the premise, the premise has not changed, the item is already closed (the error names who reaffirmed it, when, and the event id), or the decision itself was superseded or rejected. Resolves the decision by `decision_id` or a free-text `description` (+ optional `topic`) — exactly one is required, the same fluent resolution `disagree_decision` uses; an ambiguous or unmatched description is a successful `{outcome: "ambiguous"|"not_found"}` result with nothing written. When the decision has exactly one open item, `premise_id` is not needed; with several, the call returns a successful result shaped `{outcome: "ambiguous", field: "premise", items: [...]}` listing them, with nothing written — re-call with `premise_id` from that list. The reply gives the event id and `covers`: the change(s) of the premise this answered, by ledger offset; a change recorded after it is a new item.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reason` | string | ✓ | Why it still holds: one line, in your own words. Recorded with who you are and when. |
| `actor_id` | string | — | Reaffirming actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |
| `decision_id` | string | — | The decision that still holds. Provide this or `description`, not both. |
| `description` | string | — | Free-text match for the decision. Required when `decision_id` is omitted. |
| `premise_id` | string | — | The changed premise it still holds after: a decision id or a hypothesis id, as `get_reexamine_items` lists it. Needed only when the decision has several open items. |
| `topic` | string | — | Optional topic_key filter narrowing the `description` match. |

---

### `request_decision`

Record that you are explicitly asking a question, before any decision answers it: writes a request an unanswered call is 'waiting' on. Defaults actor_id to agent:<tool>:<name> (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`) and writes source=agent. Resolved to a `Question` node by the same exact-match rule `capture_decision`'s `question` uses: a match on the normalized text is reused, otherwise the node is created. Unlike answering, asking is never suppressed as a duplicate — the same question can be asked more than once, each its own request. The reply's `request_id` is what `capture_decision`'s `answers` (or `loomtracer capture --answers`) takes to link a later decision to this request without repeating the words.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | ✓ | The question, in the asker's own words: one line. Two asks whose text is the same after lowercasing, collapsing spaces and dropping trailing punctuation share one question node. |
| `actor_id` | string | — | Asking actor. Defaults to `agent:<tool>:<name>` when omitted (over MCP-over-HTTP: the bearer token's actor for an agent token; under a person's credential, the MCP session's agent, `agent:mcp-http:<session>`). |

---

### `classify_queue_submit`

Submit captures for one or more pending ingest batches as a single classification event, moving every listed batch id from pending to classified together. HTTP-transport only (hivemind-zdsh.18). Pass more than one `batch_ids` entry to cover a whole session's batches in one model call, per the session-grouped cadence. Refuses a batch id the tenant never received, naming it, with nothing recorded. Refuses with an error once the daily classification cap is hit — batches stay pending for the next day rather than being dropped.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batch_ids` | string[] | ✓ | Batch id(s) from `classify_queue_list`, all from the same session when more than one. |
| `captures` | object[] | ✓ | CaptureItem objects, same shape as `capture_decision`/`capture_evidence` produce. |
| `model` | string | — | Classifier identifier recorded on the event. Defaults to `agent:worker-a` (subscription-seat classification). |

---

## Read tools

### `get_waiting_requests`

Open requests: what was explicitly asked (`request_decision`, `loomtracer ask`) and no decision has answered yet, oldest first. Each item carries the `request_id` `capture_decision`'s `answers` takes, the question, `asked_at` (the ask's own time, never a guess) and who asked (`requested_by`). Nothing is ranked or inferred; a request leaves the list when a decision answers its question. Equivalent to `loomtracer query get_waiting_requests`. `data.truncated` / `data.next_cursor` continue a long list.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | The `data.next_cursor` of the previous page. |
| `limit` | integer | — |  |

---

### `get_contested_decisions`

Decisions in contest, oldest first: where actors disagree, so nobody has to go looking. `contest.kind` is `disagreement` (at least one actor accepted the decision and one rejected it, and nobody superseded it: `accepted_by` and `rejected_by` name the sides) or `conflicting_answers` (the decision is accepted and current, and another accepted, current decision answers the same question with a different chosen option: `conflicts_with` lists them). Each item also has `asked_at` (when its question was first explicitly asked, if ever) and `decided_at` (when it was recorded). Nothing is ranked, picked or resolved for you; a supersession takes a decision off the list. Equivalent to `loomtracer query get_contested_decisions`. `data.truncated` / `data.next_cursor` continue a long list.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | The `data.next_cursor` of the previous page. |
| `limit` | integer | — |  |

---

### `get_open_why_decisions`

Binding decisions whose why is still to answer, oldest first: decisions in force that clear the decision floor (they bind something or are costly to undo, by their capturer's own answers) and rest only on what their own capture brought, so nobody has tied them to anything outside the call that recorded them. A decision is listed only when it follows from no earlier decision and replaces none, no person accepted it and it records no person's delegation, and every observation, assumption and bet it rests on is its own (recorded with it, and rested on by no other decision). Each item has `deciders` (who accepted it; empty while nobody has), `recorded_by`, `captured_at`, the two floor answers (`binds`, `undo_cost`) and `rests_on`, what it rests on. This is an open state, not a refusal: every listed decision was written. Nothing is suggested or linked for you. `left_out` counts the in-force decisions the list did not consider because they are below the floor or were never asked. A decision leaves the list when it follows from another decision, a person decides it, a second decision shares its evidence or it is superseded. Equivalent to `loomtracer query get_open_why_decisions`. `data.truncated` / `data.next_cursor` continue a long list.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | The `data.next_cursor` of the previous page. |
| `limit` | integer | — |  |

---

### `get_reexamine_items`

Re-examine items: the decisions that rest on something that changed and that nobody has looked at again, so a disagreement or a supersession does not stop at the first decision. Equivalent to `loomtracer reexamine`. A decision gets an item for each premise it rests on directly (a prior decision it follows from, or an assumption or bet) that was superseded, rejected, contested or refuted; a decision that is the only one to have superseded its premise is the change itself and gets no item for it. Nothing is stored as open: an item is derived on every read, and closes only when someone records `reaffirm_decision` ("still holds", with who and why) after the change, or when the decision itself is superseded or rejected. A premise that changes again reopens the item (the earlier reaffirmations stay visible as `earlier_reaffirmations`). A contested premise opens an item but is not a verdict, so it never flips `still_holds`. Each item names the `dependent` (id, title, status, project), the `premise` (`premise_id`, `premise_kind`, `premise_label`), the `change` (`kind`, `by_ids`, `at_offset`, `at_time` where the graph states one) and `state`: `open`, `reaffirmed` (with each reaffirmation's actor, time and reason), `dependent_superseded` or `dependent_rejected`. Open items only unless `include_closed`. Narrow to one decision with `decision_id` or `description` (+ `topic`; an ambiguous or unmatched description is a successful `{outcome: "ambiguous"|"not_found"}` result), to one premise with `premise_id` (which also fills `data.propagation`: N of M dependents re-examined, `unfinished` once an item has been open longer than the 14-day window), and ask from a `project` (decisions in it, the project it is part of and the projects it depends on are named; the rest are counted in `data.not_shown`, never named). `data.truncated` / `data.next_cursor` continue a long list; nothing is dropped silently.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | The `data.next_cursor` of the previous page. |
| `decision_id` | string | — | Only the items on this decision. Provide this or `description`, not both. |
| `description` | string | — | Free-text match for the decision whose items to list. |
| `include_closed` | boolean | — | List closed items too (reaffirmed, or on a decision that stopped standing). Default false. |
| `limit` | integer | — |  |
| `premise_id` | string | — | Only the items resting on this premise (a decision or hypothesis id); also returns its propagation completeness. |
| `project` | string | — | Ask from this project: a registered handle or a personal address. An unregistered handle is refused. |
| `topic` | string | — | Optional topic_key filter narrowing the `description` match. |

---

### `get_changed_decisions`

Decisions revised or superseded recently, most recently changed first. Each item has `asked_at` and `decided_at` and lists its `changes` inside the window, oldest first, each cited by ledger event (`event_origin`, `citation_id`) with its time and actor: `superseded` (by which decision), `retitled` (from, to), `moved` (from, to), or a premise that stopped standing (`premise_refuted` with the refuting evidence, `premise_superseded`, `premise_rejected`). A premise's change reaches only the decisions that already rested on it at that moment. Facts only, no verdict on whether the change was good, and nothing per person. The window is `since` (default: the last 7 days) to `until`, echoed in `data.since` / `data.until`; an event with no timestamp is always listed, undated. Equivalent to `loomtracer query get_changed_decisions`. `data.total_matches` counts every decision that changed in the window; `data.next_cursor` continues.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | The `data.next_cursor` of the previous page. |
| `limit` | integer | — |  |
| `since` | string | — | RFC3339 start of the window. Defaults to seven days before now. |
| `until` | string | — | RFC3339 end of the window. Defaults to now and later. |

---

### `get_decision`

Fetch a single decision by id. Returns null when absent.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | ✓ |  |

---

### `get_relevant_decisions`

List decisions whose topic_keys contain the given topic. Optional status filter.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | ✓ |  |
| `status` | string | — |  |

---

### `get_situational_decisions`

"What should I know before I touch this?" — decisions bearing on the given situation, no id or hand-typed question needed. Matches by topic key and by term overlap against evidence content (deterministic, no LLM); each result names which matched and includes held_up/reasons from get_decision_outcome verbatim. A topic key matches when every one of its parts is a term of the situation: `auth` for src/api/auth.rs, `project-scope` for src/queries/project_scope.rs or the branch feature/project-scope, not for src/queries/project.rs alone. Topic matches are structural; evidence matches are a fuzzy heuristic over free text, not a structural path reference — treat matched_via[].kind accordingly.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | string[] | ✓ | Touched files/dirs and/or a branch name. All entries are tokenized the same way (split on path separators, lowercased, stopwords/extensions dropped). |
| `cursor` | string | — |  |
| `limit` | integer | — |  |
| `project` | string | — | Ask from this project (a registered handle, or a personal address such as personal:human:alex). Matches come from that project first, then the project it is part of (inherited constraints, labelled `from Platform; Billing is part of it`), then one hop over the projects it depends on (`from Auth; Billing depends on it`); each match carries `scope`, and `data.scope` lists the projects looked in and how many linked projects and part_of levels were not followed. Staleness (superseded, refuted) shows across the hop unchanged. An unregistered handle is refused with a hint. Omit to search the whole tenant. |
| `since_offset` | integer | — | Annotate results with whether they changed since this ledger offset (exclusive). |
| `since_timestamp` | string | — | Annotate results with whether they changed since this RFC3339 timestamp. |

---

### `get_supersession_chain`

Return the linear supersession chain a decision sits in, oldest first. Equivalent to `loomtracer query chain`. Resolves by decision_id or a free-text description — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error; re-call with decision_id from that list. When no decision contains every word but some contain at least half of them, the closest one (the one whose title, topic keys and recorded question carry the most of what you asked, and that lacks fewer of the words than the next one; at least two of the words must sit in its title and topic keys) is answered as if you had named it, with `close_match: {decision_id, title, missing_terms}` beside `data` naming the words it lacks: read it before you rely on the answer. So is a decision that lacks a word but carries more of the question in its title and topic keys than every decision that holds all of its words only in its text (a long rationale that happens to say them all). Close candidates that are equally close come back in the ambiguous shape, each with `missing_terms`, and none is picked for you; so does a decision whose title and topic keys hold fewer than two of the words, since the word it lacks may be the one you asked about. A close candidate ranked ahead of decisions that hold every word is named only if three of your words (all of them, in a shorter question; two of three while at most one other decision holds every word and says one of them in its title) sit in its title and topic keys; otherwise it is listed with them. When several decisions hold every word, the first is named only if its title and topic keys hold more than half of your words (all three, in a three-word question when two or more of the others sit on the same subject), and, when four or more decisions hold every word, also a word of your question that none of the others says in its title and topic keys; otherwise they all come back in the ambiguous shape, none picked for you, with nothing in `missing_terms`. A decision that alone holds every word but has fewer than two of your words in its title and topic keys is not named either when decisions that lack some of the words exist: it comes back first in the ambiguous shape, the close candidates after it, each with `missing_terms`. A decision recorded more than once and linked as the same decision comes back as one: the earliest record that matches, with `also_recorded_as: [{decision_id, title}]` beside `data` naming the other records (they are the same decision, not rivals). A description matching nothing is also a successful result, shaped `{outcome: "not_found"}` (there is no #N/--pick over MCP to retry against, so there is nothing further to disambiguate).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | — | The decision to inspect. Provide this or `description`, not both. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `get_decision_neighborhood`

"Why does this decision look the way it does?" — the decision's answer plus its one-hop graph. `data.root` carries the title, rationale, chosen and rejected option labels (options with no choice recorded are `open_options`, not rejected), who decided, whether it still holds (with `still_holds.days_held`, the whole days nothing in the graph replaced it, which is not evidence it was carried out), and status. `data.root.quality` is how well the record supports the decision, in the same response: the seven-dimension profile exactly as `score_decision` returns it (each dimension assessed with a `level` none|partial|solid, `reasons` and `node_ids`, or not assessed with `why`; no composite, tier or score; absent when the root decision is not present). `data.nodes` and `data.edges` are the neighborhood: proposing/accepting/rejecting actors, options, the chosen option, evidence, premised hypotheses (with their supporting/refuting evidence one hop further), and supersession links in both directions; every node except actors has a `label` (a decision's title, an option's label, a hypothesis' statement, an evidence item's content clipped to 200 characters). Every edge in `data.edges` is an arrow from the newer node to the older node: `from`/`to` are the arrow's ends, an edge's `label` reads the relation along it, and `reversed` marks an arrow that runs against the relation's stored direction. `data.timeline` is the decision's dated story from the ledger, oldest first: when the question was asked (`asked`), the decision recorded, accepted or rejected, superseded, retitled or moved, and when a premise it rests on stopped standing, each cited by ledger event with its time and actor, plus `asked_at`, `decided_at` and `asked_to_decided_seconds` (absent when nobody asked first). Equivalent to `loomtracer query why`. Resolves by decision_id or a free-text description or question ("why did we move the demo cell to shared Postgres") — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error; re-call with decision_id from that list. When no decision contains every word but some contain at least half of them, the closest one (the one whose title, topic keys and recorded question carry the most of what you asked, and that lacks fewer of the words than the next one; at least two of the words must sit in its title and topic keys) is answered as if you had named it, with `close_match: {decision_id, title, missing_terms}` beside `data` naming the words it lacks: read it before you rely on the answer. So is a decision that lacks a word but carries more of the question in its title and topic keys than every decision that holds all of its words only in its text (a long rationale that happens to say them all). Close candidates that are equally close come back in the ambiguous shape, each with `missing_terms`, and none is picked for you; so does a decision whose title and topic keys hold fewer than two of the words, since the word it lacks may be the one you asked about. A close candidate ranked ahead of decisions that hold every word is named only if three of your words (all of them, in a shorter question; two of three while at most one other decision holds every word and says one of them in its title) sit in its title and topic keys; otherwise it is listed with them. When several decisions hold every word, the first is named only if its title and topic keys hold more than half of your words (all three, in a three-word question when two or more of the others sit on the same subject), and, when four or more decisions hold every word, also a word of your question that none of the others says in its title and topic keys; otherwise they all come back in the ambiguous shape, none picked for you, with nothing in `missing_terms`. A decision that alone holds every word but has fewer than two of your words in its title and topic keys is not named either when decisions that lack some of the words exist: it comes back first in the ambiguous shape, the close candidates after it, each with `missing_terms`. A decision recorded more than once and linked as the same decision comes back as one: the earliest record that matches, with `also_recorded_as: [{decision_id, title}]` beside `data` naming the other records (they are the same decision, not rivals). A description matching nothing is also a successful result, shaped `{outcome: "not_found"}` (there is no #N/--pick over MCP to retry against, so there is nothing further to disambiguate).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | — | The decision to inspect. Provide this or `description`, not both. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `search_decisions`

Full-text search over decisions. Equivalent to `loomtracer query search`. Every word of `q` must match. When no decision matches every word of a phrase of three or more words (counted as you wrote them, question words included), the answer is the one `recall_decisions` gives for it: decisions that hold some of the words, each with `missing_terms` naming the words it lacks (read it before you rely on the item), and `data.query` is the query as you wrote it. A query that shares no rare word with any decision returns no items.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actor_id` | string[] | — |  |
| `cursor` | string | — |  |
| `limit` | integer | — |  |
| `q` | string | — | Full-text query. |
| `since` | string | — | RFC3339 lower bound for the time the decision was decided: when it was proposed, or for a decision drafted from a transcript the time of the turn it was said in. |
| `source` | string[] | — |  |
| `status` | string[] | — |  |
| `topic` | string[] | — |  |
| `until` | string | — | RFC3339 upper bound for the time the decision was decided: when it was proposed, or for a decision drafted from a transcript the time of the turn it was said in. |

---

### `recall_decisions`

Layer-3: search for decisions matching a query and return them ranked alongside a concise text digest — one call answers 'what was decided about X?'. The rank is ordinal, not a confidence score: decisions matching every word of the question come first (the one whose title and topic keys carry more of the words first), except that a decision lacking a word whose title and topic keys carry more of the question than any of them comes before them; then those matching at least half of them, the one whose title, topic keys and recorded question carry more of the question first (among those equally about it, fewest missing first, then the one whose title or topic keys carry more of the matched words), and a word also matches its inflections ("moving" finds "moves"). Each close match lists the words it lacks in `missing_terms`, so a partial match is never presented as a full one; read it before deciding it covers your question. A decision holding fewer than half of the words is also listed, after those, when the words it holds are rare in the ledger (three that few decisions hold, or two of them its title or topic keys hold, or two that one or two decisions hold each, one of them in its title or topic keys, or, in a ledger of 16 decisions or fewer, one that only its title or topic keys hold, or words its title or topic keys hold that few decisions hold and that are most of what the question asks, such as the one decision titled for the licence when you ask what licence the code is under, or two of the question's words that its title or topic keys spell together, such as `FileStore` for "file store", or the one decision about the question more than every decision listed, whose title or topic keys hold the rarest word any decision holds that no listed decision's do, when none of them says more of the words in its title or topic keys, such as the decision titled for the shelf when you ask which shelf people should put us on, or else the one more about the question than every decision listed whose title or topic keys hold two of the words and whose words are as rare as three that few decisions hold, such as the decision titled for the leftover when you ask how the forecast draws the time a long job still needs, or else, beside the listed decision whose title or topic keys carry the most of the words, the decisions whose title or topic keys carry as many (two at least), two of them words you wrote side by side, and that are about the question nearly as much, such as the two titled for what the graph draws when you ask whether the graph draws anyone, where "graph" is held by a third of the decisions); at most three, plus that one and at most three such peers, each with `missing_terms`. A decision recorded more than once and linked as the same decision is one item, the earliest record that matches, with the other records in `also_recorded_as` (`{decision_id, title}` each). The digest is deterministic template rendering sourced from decision fields only; every contributing decision ID is listed in digest.cited_decision_ids. Ask it as a question if you like ("what did we decide about projects"): question words are ignored and listed in `ignored_words`, and a question made only of question words adds no text filter. Pass `project` to ask from one project: decisions come from that project first, then the project it is part of, then one hop over the projects it depends on, and `scope` says where the answer looked and where it stopped. Returns: { query, ignored_words?, ranked: { items (each with missing_terms? when it is a close match, and also_recorded_as? when the decision was recorded more than once), total_matches (records matched), truncated, next_cursor (when truncated: pass it as `cursor` for the next page) }, digest: { summary, cited_decision_ids }, scope? }.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actor_id` | string[] | — |  |
| `cursor` | string | — | Continue a truncated answer: the `ranked.next_cursor` of the previous page. |
| `limit` | integer | — | Max results to return and summarize (default 5, max 10). |
| `project` | string | — | Ask from this project (a registered handle, or a personal address such as personal:human:alex). Decisions come from that project first, then the project it is part of (inherited constraints, labelled `from Platform; Billing is part of it`), then one hop over the projects it depends on (`from Auth; Billing depends on it`); each item in `ranked.items` carries `scope`, and `data.scope` lists the projects looked in and how many linked projects and part_of levels were not followed. Staleness (superseded, refuted) shows across the hop unchanged. An unregistered handle is refused with a hint. Omit to search the whole tenant. |
| `q` | string | — | Free-text search query. |
| `since` | string | — | RFC3339 lower bound for the time the decision was decided: when it was proposed, or for a decision drafted from a transcript the time of the turn it was said in. |
| `source` | string[] | — |  |
| `status` | string[] | — |  |
| `topic` | string[] | — | Filter by topic keys. |
| `until` | string | — | RFC3339 upper bound for the time the decision was decided: when it was proposed, or for a decision drafted from a transcript the time of the turn it was said in. |

---

### `recent_decisions`

List the decisions decided in a window, newest record first: those proposed in it and those a classifier drafted from a transcript (`capture:<event>:<index>`), a draft by the time of the turn it was said in, which can be days before the classification that recorded it. Each item has `decided_at` (the time the window used) and `creation` (the event that recorded it). Equivalent to `loomtracer query recent_decisions`.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `since` | string | ✓ | RFC3339 lower bound for the time the decision was decided. |
| `actor` | string[] | — | Actor id patterns, matching the CLI --actor filter. |
| `cursor` | string | — |  |
| `limit` | integer | — |  |
| `source` | string[] | — |  |
| `status` | string[] | — |  |
| `topic` | string[] | — |  |
| `until` | string | — | RFC3339 upper bound for the time the decision was decided. |

---

### `dump_graph`

Render the current decision graph as Graphviz DOT.

---

### `loomtracer_compact_view`

Layer-3 compact view of a decision subgraph. Applies signal/noise semantics: terminal decision is fully preserved; superseded predecessors, unchosen options, and resolved blockers are elided and counted. Contested decisions are never compacted. Resolves by decision_id or a free-text description — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error; re-call with decision_id from that list. When no decision contains every word but some contain at least half of them, the closest one (the one whose title, topic keys and recorded question carry the most of what you asked, and that lacks fewer of the words than the next one; at least two of the words must sit in its title and topic keys) is answered as if you had named it, with `close_match: {decision_id, title, missing_terms}` beside `data` naming the words it lacks: read it before you rely on the answer. So is a decision that lacks a word but carries more of the question in its title and topic keys than every decision that holds all of its words only in its text (a long rationale that happens to say them all). Close candidates that are equally close come back in the ambiguous shape, each with `missing_terms`, and none is picked for you; so does a decision whose title and topic keys hold fewer than two of the words, since the word it lacks may be the one you asked about. A close candidate ranked ahead of decisions that hold every word is named only if three of your words (all of them, in a shorter question; two of three while at most one other decision holds every word and says one of them in its title) sit in its title and topic keys; otherwise it is listed with them. When several decisions hold every word, the first is named only if its title and topic keys hold more than half of your words (all three, in a three-word question when two or more of the others sit on the same subject), and, when four or more decisions hold every word, also a word of your question that none of the others says in its title and topic keys; otherwise they all come back in the ambiguous shape, none picked for you, with nothing in `missing_terms`. A decision that alone holds every word but has fewer than two of your words in its title and topic keys is not named either when decisions that lack some of the words exist: it comes back first in the ambiguous shape, the close candidates after it, each with `missing_terms`. A decision recorded more than once and linked as the same decision comes back as one: the earliest record that matches, with `also_recorded_as: [{decision_id, title}]` beside `data` naming the other records (they are the same decision, not rivals). A description matching nothing is also a successful result, shaped `{outcome: "not_found"}`. Returns data: null when a directly-supplied decision_id itself does not exist.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | — | The decision to compact. Provide this or `description`, not both. If mid-chain, the terminal (newest) decision in the supersession chain is used as the focal node. When the chain forks (several decisions superseded the same one, or one decision superseded several), no single terminal exists: the decision where it forks is the focal node and `supersession_chain.forks` names the decisions on the far side. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `summarize_decisions`

Layer-3: produce a concise text summary of one or more decisions. All content is sourced from decision record fields — no invented content. Every decision that contributed to the summary is listed in cited_decision_ids. Modes: single (one decision), cluster (multi-decision synthesis), chain (follows the supersession chain from the given decision_id).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_ids` | string[] | ✓ | IDs of decisions to summarize (1–10). |
| `mode` | string | — | single = one decision digest; cluster = multi-decision synthesis; chain = supersession chain evolution. Defaults to single when one ID is given, cluster when multiple. |

---

### `get_decision_outcome`

"Did this decision hold up?" — leads with the decision, rationale, chosen and rejected options (options with no choice recorded are `open_options`, not rejected), and who decided it, then whether it still holds: superseded (by which decision), stale premises (premised on a refuted hypothesis, or a prior decision it follows from that was superseded or rejected), contested (unresolved disagreement), or rejected (someone rejected it and nobody accepted it; the reason names who), each with its contributing reasons attached. `still_holds.days_held` is the whole days nothing in the graph replaced it (not evidence it was carried out; absent when a date is not recorded). `data.quality` is how well the record supports the decision, in the same response: the seven-dimension profile exactly as `score_decision` returns it (framing, alternatives, information, reasoning, values_tradeoffs, bias_exposure, calibration), each either assessed (`level` none|partial|solid, `reasons`, `node_ids`) or not assessed (`why`); no composite, tier or score, and a level says what the record states, not that the decision is sound. A not-found or ambiguous answer carries no `quality`. No LLM involved; derived purely from graph edges. Equivalent to `loomtracer query verify`. Resolves by decision_id or a free-text description — exactly one is required. An ambiguous description returns a successful result shaped `{outcome: "ambiguous", candidates: [...]}`, not an error; re-call with decision_id from that list. When no decision contains every word but some contain at least half of them, the closest one (the one whose title, topic keys and recorded question carry the most of what you asked, and that lacks fewer of the words than the next one; at least two of the words must sit in its title and topic keys) is answered as if you had named it, with `close_match: {decision_id, title, missing_terms}` beside `data` naming the words it lacks: read it before you rely on the answer. So is a decision that lacks a word but carries more of the question in its title and topic keys than every decision that holds all of its words only in its text (a long rationale that happens to say them all). Close candidates that are equally close come back in the ambiguous shape, each with `missing_terms`, and none is picked for you; so does a decision whose title and topic keys hold fewer than two of the words, since the word it lacks may be the one you asked about. A close candidate ranked ahead of decisions that hold every word is named only if three of your words (all of them, in a shorter question; two of three while at most one other decision holds every word and says one of them in its title) sit in its title and topic keys; otherwise it is listed with them. When several decisions hold every word, the first is named only if its title and topic keys hold more than half of your words (all three, in a three-word question when two or more of the others sit on the same subject), and, when four or more decisions hold every word, also a word of your question that none of the others says in its title and topic keys; otherwise they all come back in the ambiguous shape, none picked for you, with nothing in `missing_terms`. A decision that alone holds every word but has fewer than two of your words in its title and topic keys is not named either when decisions that lack some of the words exist: it comes back first in the ambiguous shape, the close candidates after it, each with `missing_terms`. A decision recorded more than once and linked as the same decision comes back as one: the earliest record that matches, with `also_recorded_as: [{decision_id, title}]` beside `data` naming the other records (they are the same decision, not rivals). A description matching nothing is also a successful result, shaped `{outcome: "not_found"}` (there is no #N/--pick over MCP to retry against, so there is nothing further to disambiguate).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | — | The decision to evaluate. Provide this or `description`, not both. |
| `description` | string | — | Free-text description to resolve to a decision when the id is not known. |
| `topic` | string | — | Narrows description resolution to decisions carrying this topic key. |

---

### `decision_quality_candidates`

Bulk outcome pull: returns the "did it hold up" record for all decisions (or a filtered subset), each with its outcome signals (superseded, stale premises, contested, rejected) and their contributing reasons. These are outcomes, not quality: how well a decision was made is `score_decision`. Designed for Mechanism A — the factory loop calls this to pull recent decisions and their signals. No LLM involved.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | Pagination cursor from a previous response's `next_cursor` field. Keep following it while `truncated` is true; an empty page can still be truncated. |
| `limit` | integer | — | Maximum results to return (1–1000, default 25). With `only_with_signals`, the number of decisions a page examines: it returns those that carry a signal, so it can hold fewer, or none. |
| `only_with_signals` | boolean | — | When true, only decisions with at least one outcome signal are returned. Default false. |
| `since_event_origin` | integer | — | Minimum ledger event offset (inclusive). Filter to decisions proposed at or after this offset. Use 0 or omit for all. |

---

### `get_decision_context`

Derive the context record for a single decision: the conditions under which it was made. Returns five feature groups — authorship shape (human-authored / agent-proposed+human-accepted / agent-only / unknown) with proposer_id (who recorded it) and accepted_by (who actually decided — may differ from proposer_id, or be empty when unreviewed), source system and model/session reference, review depth (unreviewed / self_accepted / peer_reviewed / disputed / rejected), evidence and hypothesis counts, and context richness proxies (options count, rationale character count). No LLM involved; derived purely from graph edges. Pair with get_decision_outcome for causal attribution. Returns null when the decision_id is not found.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | ✓ | The decision to evaluate. |

---

### `decision_context_candidates`

Bulk context-feature pull: returns context records for all decisions (or a filtered subset), each with authorship shape, source, review depth, `delegated_by` (the human whose delegation an agent's self-acceptance fell within; absent when the agent decided alone), evidence/hypothesis counts, and rationale richness proxies. Designed to complement decision_quality_candidates — context is the independent variable side of the causal pair. No LLM involved.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | Pagination cursor from a previous response's `next_cursor` field. |
| `limit` | integer | — | Maximum results to return (1–1000, default 25). |
| `since_event_origin` | integer | — | Minimum ledger event offset (inclusive). Filter to decisions proposed at or after this offset. Use 0 or omit for all. |

---

### `score_decision`

The quality profile of one decision: the seven dimensions (framing, alternatives, information, reasoning, values_tradeoffs, bias_exposure, calibration), each standing alone. A dimension is either assessed (a level of none, partial or solid, the reasons behind it and the node ids they rest on) or not_assessed (and why: no level, no guess). Levels come from published rules over what the record states, never from a judgement of whether it is sound, so reasoning, framing, bias exposure and calibration stop at partial and values_tradeoffs is not assessed without a model. Only what was recorded before the decision or attached at capture counts; later evidence is shown as later and never raises a level. Also returns attention lines (for example high confidence declared over a bet alone) and a provenance object that says whether the decision is authored by an agent and not yet reviewed by a human. There is no composite score and no tier: no number in the response says how good a decision is; the floors need no model and no network. When a model has assessed the decision (an optional, separate step), its answer for each dimension — a level with its quoted basis, or not_assessed — appears beside the floors as model_assessment, with the model and prompt version; it never changes a floor. Returns null data when decision_id is not found.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decision_id` | string | ✓ | The decision to profile. |

---

### `scan_decision_quality`

One page of attention findings: decisions that need a look now, derived from what the graph already states. Kinds: bet_past_check_date (a declared bet's check date has passed and nothing supports or refutes it), premise_superseded and premise_rejected (a decision it follows from was superseded or rejected), assumption_refuted and bet_failed (something it rests on was refuted), evidence_not_rechecked (the newest evidence linked to it is older than the window, 90 days by default), propagation_unfinished (it was superseded and a decision resting on it is still open for re-examination more than 14 days after; this one is flagged on the superseded decision itself, and a dependent that someone has recorded as still holding is no longer flagged for that premise by the other kinds). Each finding carries a stable finding_id (the same while its basis is unchanged, so consumers can dedupe), the flagged decision's own decision_title, the reason in words (naming every decision, bet, assumption or evidence item it mentions by its own title, statement or content, never by a bare id), the node ids it rests on, its basis_at time when the graph records one, and the dimensions it bears on with their levels and reasons. Only decisions that still stand (not superseded, not rejected) are flagged, one hop from what changed; propagation_unfinished is the exception, flagged on the superseded decision, and bears on no dimension. Findings are ordered by decision id, not by priority; this is not a ranking or a grade. When truncated is true, pass data.next_cursor as cursor to continue. No LLM involved; works self-hosted.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | Pagination cursor: the `data.next_cursor` of a previous response. |
| `evidence_window_days` | integer | — | Days after which the newest evidence linked to a decision counts as not re-checked (default 90). |
| `kinds` | string[] | — | Only these kinds of finding. Omit for all seven. |
| `limit` | integer | — | Maximum findings to return (1–1000, default 25). |

---

### `get_suggestions`

One page of what needs a look and has not been dealt with: the attention findings of scan_decision_quality (same kinds, same shape: finding_id, kind, decision_id, decision_title, the reason in words, the node ids it rests on, basis_at when the graph records one, and the dimensions it bears on with their levels and reasons), without the findings that have been acknowledged (matched by finding_id) unless exclude_acknowledged is false. A finding's finding_id changes when its basis does, so a finding whose premise moved on after it was acknowledged is shown again. The page is filled from the findings that remain: it holds limit findings whenever that many remain, and when truncated is true, data.next_cursor resumes. A finding is acknowledged with acknowledge_suggestion, or by a consumer that records suggestion.surfaced and notification.acknowledged itself; an acknowledgement with a snooze_until hides the finding only until that moment. Findings are ordered by decision id, not by priority; this is not a ranking or a grade. No LLM involved; works self-hosted.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | Pagination cursor: the `data.next_cursor` of a previous response. |
| `evidence_window_days` | integer | — | Days after which the newest evidence linked to a decision counts as not re-checked (default 90). |
| `exclude_acknowledged` | boolean | — | Leave out findings that have been acknowledged: what is new since you last looked (default true). False returns every finding. |
| `kinds` | string[] | — | Only these kinds of finding. Omit for all seven. |
| `limit` | integer | — | Maximum findings to return (1–1000, default 25). |

---

### `rank_decisions_by_importance`

Which decisions carry the most impact, most first, each with who decided it. A decision is ranked when the record gives a reason it matters: other decisions follow from it (rests_on_it: direct, and through_chains, followed up to five hops; chain_capped says when more lie beyond). More resting on it ranks higher; ties go to the newest. A decision with no such basis follows, unranked, with importance not_assessed: never a score of zero, because nothing following from a decision says nothing about it. Each row names who decided it: decided_by.kind is person, agent, agent_within_delegation (delegated_by names the person), mixed, unknown or none_recorded, read from the actors who accepted it. A decision nobody accepted reads none_recorded and is never credited to the actor who recorded it (recorded_by, shown on its own). reasons states the basis in words. A model's own judgement of stakes, irreversibility and actionability, when one exists, is shown as model_judged and never moves the rank. Importance is a separate axis: no quality score, no composite. Superseded and rejected decisions are left out unless include_not_in_force is true, and left_out counts them. ranked_decided_by tallies the ranked decisions by decider kind (never per person or agent). When truncated is true, pass data.next_cursor as cursor to continue. No LLM involved; works self-hosted.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | — | Pagination cursor: the `data.next_cursor` of a previous response. |
| `include_not_in_force` | boolean | — | Also list superseded and rejected decisions (default false: they are left out and counted in left_out). |
| `limit` | integer | — | Maximum decisions to return (1–50, default 10). |

---

### `scan_misfiled_decisions`

Flag decisions carrying a caller-named "foreign" topic key — a decision tagged with another ledger's name most likely belongs there instead (hivemind-zdsh.14). Deterministic exact-match only, no LLM, no inference beyond topic-key membership: Loomtracer does not decide what is foreign, so the caller supplies the foreign keys. Each candidate names the project it is filed under; `project` scopes the report to one project and `move_to` names where the flagged decisions belong. Read-only report — never moves a decision: move each confirmed one with `move_decision`, recorded and reversible.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `foreign_topic_keys` | string[] | ✓ | Topic keys that indicate a decision belongs to a different ledger (e.g. another rig's name). |
| `cursor` | string | — | Pagination cursor from a previous response's `next_cursor` field. |
| `limit` | integer | — | Maximum results to return (1–1000, default 25). |
| `move_to` | string | — | The registered project the flagged decisions belong in. Each candidate echoes it as `proposed_move_to`; nothing is moved by this tool — move each confirmed decision with `move_decision`. Decisions already filed there are not flagged. |
| `project` | string | — | Only decisions filed exactly under this project (a registered handle or a `personal:<actor>` address). An unregistered handle is refused, never an empty report. |

---

### `analyze_failure_modes`

Failure-mode attribution: which conditions predict decisions that do not hold up? Joins outcome signals (superseded / stale-premises / contested) with context features (authorship shape, review depth, source, evidence/options richness, and — for decisions an agent made for itself — whether a human had delegated the scope) and with the seven quality dimensions of `score_decision` (`by_condition`: one group per dimension and level — none, partial, solid, or not_assessed) and computes AGGREGATE failure-rate patterns across each. A quality level only sorts decisions into groups; it is never itself a failure, and how quickly a decision was superseded is not weighed. Reports effect sizes (failure-rate delta vs corpus baseline) and honest confidence flags based on sample size. Never returns per-person rankings — all findings are aggregate patterns. Use to answer: does agent-only authorship predict failure? Does peer review improve outcomes? Do agent decisions within a human's delegation hold up differently from ones an agent made alone? Do decisions that recorded no alternatives, or nothing they rest on, fail more often? Works on any deployment, no LLM.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `min_sample_size` | integer | — | Minimum group size required for a group to appear in top findings (default 3). Groups smaller than this are still included in breakdowns. |
| `since_event_origin` | integer | — | Minimum ledger event offset (inclusive). Filter to decisions proposed at or after this offset. Use 0 or omit for all. |

---

### `classify_queue_list`

List pending (unclassified) ingest batches with rendered turn text, plus today's classification budget. HTTP-transport only (hivemind-zdsh.18) — pass `session_id` to scope to one ingest session for the session-grouped classification cadence: one model call per session end, not one per batch.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | — | Maximum pending batches to return (default 20). |
| `session_id` | string | — | Only list batches from this ingest session. |

---

## Error handling

All tools return a standard error envelope on failure:

```json
{
  "error": {
    "code": "ACTOR_REQUIRED",
    "message": "actor_id is required for all write operations"
  }
}
```

Common error codes:

| Code | Meaning |
|------|---------|
| `ACTOR_REQUIRED` | Write tool called without `actor_id` |
| `DECISION_NOT_FOUND` | ID does not exist in the ledger |
| `SUPERSESSION_CYCLE` | `supersedes_id` would create a cycle |
| `INVALID_TOPIC_KEY` | Topic key contains invalid characters |
