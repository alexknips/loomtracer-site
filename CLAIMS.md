# What the site claims, and the evidence

Every claim on the landing page (`website/src/pages/index.astro`) and the use cases page
(`website/src/pages/use-cases.astro`) of https://loomtracer.ai (on Vercel), with what it rests on. Kept next to the copy so that a
change to either is a change to both.

**The rules the copy follows.** Only what is in a release is said to work today. Anything merged
but not released, or under way, says "coming next". Anything decided but not built says "planned".
Since 2026-10-02 the landing page shows only what works today and says so once ("Everything on this page
works in v0.7.0, the current release"), with no status marks; the legend is on the use cases page only,
in two lines next to its tags: works today = in v0.7.0 (25 Sep 2026), coming next = merged or under way,
not yet released, planned = decided, not built, and the drawings' marks (solid, COMING NEXT, dashed
PLANNED).
No claim that Loomtracer checks before it acts, or that it makes decisions better: the side-by-side
that could show that is planned. No internal names, tracker ids or changelog quotes in the public
copy. The product is Loomtracer (since 2026-10-07; it was HiveMind). Its command-line tool is still
`hivemind` (Alex, 2026-10-07: "the tool does not need to be renamed yet"), so every command, install
step, MCP server name and environment variable on the site keeps that name, and each page that first
names the tool says so once ("Loomtracer's command-line tool, `hivemind`").

**Where the evidence comes from.** "Works today" claims cite the `v0.7.0` release of
[alexknips/loomtracer](https://github.com/alexknips/loomtracer/releases/tag/v0.7.0) (published
2026-09-25) and the section of its `CHANGELOG.md` that describes the behaviour, or the release
assets and install script. The capture plugins are the one exception: no release ships them, the
marketplace installs them from hivemind `master`, so what that plugin does with the `v0.7.0` binary,
tested as a stranger would install it, counts as works today. "Coming next" and "planned" items
rest on the product plan as of 2026-09-26; the deck at `/pitch/` (2026-09-24) says the same things
where it covers them. The deck was rewritten as Loomtracer's pitch on 2026-10-06 (site PR #24, by Jeff Miao, who owns
the deck); rows below that name a deck slide refer to the deck before that.

Last checked: 2026-10-02, against `v0.7.0` (still the latest release on that day) and hivemind master for
what is "coming next".

**The landing page's shape (since 2026-10-01).** The founder's review of the live page on 2026-09-30: "this is
too much duplication, about holding up!", "way too much text", and "What it is useful for is amazing and we
need to get to it sooner". So the page tells the problem once (the three cards under the hero: the next
session undoes it, nobody knows why, nobody can say if it held up), goes straight on to the use cases, and
keeps the rest short. The lists that were under "Where it is" are the use cases page's three sections (the
header's "Roadmap" goes there); the real Claude Code session is in the deck, linked from "How to start".
The rows below still hold for whichever page says the claim.

**Since 2026-10-02 the landing page shows only what works today**, about 1,000 words (1,985 before; visible
text outside the drawings). The founder handed the site to the mayor that day ("think of improvements to
simplify it"). The five cards that were coming next or planned (the bet, the questions still waiting, the
seven dimensions, the drifting projects, speed with consistency and flexibility) are told once, on the use
cases page, the three drawings with them; one line on the landing points there. The hero is the headline,
one line and the two buttons. "Who it is for" and "How it compares" are one short section, which now holds
"not only for engineering" and "one person and their agents"; the line that capture over MCP, superseding
and local-first exist elsewhere is gone from the page (`vision/README.md` keeps it). The install steps
link the Quickstart for `hivemind: not found` instead of explaining it.

## Works today (v0.7.0)

| Claim | Evidence |
|---|---|
| Claude Code, Codex and Cursor connect over MCP; a CLI does the same | `v0.7.0` ships `hivemind mcp` (stdio) and the HTTP `/mcp` route; the site's [MCP setup](website/src/content/docs/guides/mcp-setup.md) documents all three clients; CHANGELOG v0.7.0 "Over MCP and HTTP too" and the `hivemind-context` plugin for Claude Code and Codex |
| Your agent records a decision with the options that lost, the reasons, and who decided, you or the agent | CHANGELOG v0.7.0, Added, Attribution: `--decided-by` records the human who decided when an agent captures; Breaking: a chosen option now self-accepts (a recorded choice no longer sits at `proposed`); Fixed: "Attribution is honest" (the recorder is no longer printed as the decider). Deck slide "You make the call. The agent writes it down." is a real session of it |
| Ask why in a fresh session: rationale, options chosen and rejected, who decided, whether it still holds | CHANGELOG v0.7.0, Added, Fluent verbs: "`why` answers why" (the decision's brief). `hivemind query why` is the documented alias of `get_decision_neighborhood` in [cli.md](website/src/content/docs/reference/cli.md). Deck slide "A new session asks why." |
| Ask "did it hold up?" and get whether it stands, was replaced, disputed, or rests on a stale premise | CHANGELOG v0.7.0, Fixed: "'Did it hold up?' works" (it returned an error in v0.6.0); `hivemind query verify` is the documented alias of `get_decision_outcome` in cli.md. Deck slide "Did it hold up?" |
| Replace a decision and the old one reads superseded; dispute one and it reads contested; nothing is edited or deleted | Status is derived from edges (the [Decision Graph](website/src/content/docs/concepts/decision-graph.md) page); `supersede` and `disagree` are write commands in cli.md and `DisagreeArgs` in `v0.7.0` `src/cli/args.rs` (positional description, `--reason`). The ledger is append-only (CHANGELOG v0.7.0, "Ledger replay of events captured earlier is unaffected") |
| Every decision says what it rests on: an earlier decision, something observed, an assumption, or a bet with a date to check; a capture that names nothing is refused; a replaced premise makes dependents read stale; the capture plugin makes the agent answer before it records: with nothing to go on it records a bet, not made-up evidence, and asks for the reason (use cases page) | CHANGELOG v0.7.0, Breaking: "Capture and supersede require grounding" (the four ways to answer, exit 2 / `isError` when empty); Added, "Answers show what a decision rests on" (superseded or rejected premise makes the decision stale in `verify`, `compact-view`, `situational`, `digest`). The plugin part: the marketplace serves hivemind `master`'s plugin 0.1.1 (`7f6f0bc`), whose skill and commands put "what does this rest on?" before every capture (merged after the `v0.7.0` tag), and it works with the `v0.7.0` binary (the plugin row under Stated limits). Tested on 2026-10-01 in a throwaway home with only the `v0.7.0` release binary and the plugin from the marketplace: three `claude -p` runs (sonnet) where the request named no premise, twice in prose ("Record this decision in HiveMind: we're capping the retry delay in our HTTP client at 30 seconds instead of leaving the exponential backoff uncapped.") and once as `/hivemind-capture:capture-decision` without a grounding flag. All three answered before writing; none was refused, none dropped the capture. The prose runs loaded the `hivemind-capture` skill and called `capture_decision` with `grounding: [{"kind": "bet", "statement": "30 seconds is a suitable maximum retry delay; no supporting evidence was given with the decision"}]`, the user's words in `quote` with a `question`, not filed as evidence. The slash-command run said "No grounding was supplied, so I'll record it as a bet rather than invent evidence." and added `--bet`. Each reply then asked for the reason ("If you have a reason, such as an incident or a latency target, tell me and I'll record it as grounding."). The backstop holds: the plugin's `capture-decision.sh` run by hand with no grounding exited 2 ("a captured decision must say what it rests on; nothing was written. Answer with at least one of: …") and the ledger gained no event |
| "What should I know before I touch this?" from the current diff, each result saying whether it still holds | CHANGELOG v0.7.0, Added: "`query situational`" defaults to the current git diff; cli.md `query situational` ("each result surfaces `get_decision_outcome`'s `held_up`/`reasons`") |
| Several projects: every decision carries its project; a question from one project also looks in the project it is part of and the ones it depends on, one hop, and says where it stopped | CHANGELOG v0.7.0, Added, Projects: "Every decision carries its project", "Every answer names its project", "'What should I know' asks from one project" (the `scope` note); cli.md `query situational --project` |
| Describe a decision instead of quoting an id; an ambiguous description lists candidates instead of guessing | CHANGELOG v0.7.0, Added, Fluent verbs: `disagree`, `supersede`, `query chain`, `query why`, `query verify`, `query compact-view` take a description; an unresolved description writes nothing and lists numbered candidates |
| Look over a week of agent decisions in the terminal: accept, dispute or replace each | cli.md `review` (`--actor <pattern>`, `--since <duration>`, `--unreviewed-only`); the [Human Review](website/src/content/docs/guides/human-review.md) guide |
| Export the decision log as Markdown grouped by project | CHANGELOG v0.7.0, Added: "`hivemind export --format markdown --out <dir>`"; cli.md `export` |
| Import decisions from existing notes; they land as unreviewed | cli.md `import documents` ("land in the ledger immediately as unreviewed"); in releases since v0.5.0 (CHANGELOG v0.5.0) |
| Import decision candidates from a Google Doc or a git-tracked file, experimental; Google Docs only, no Confluence | `v0.7.0` `docs/INGESTION_CONNECTORS.md` (`hivemind import connector --url …`, Google Docs and git connectors; Confluence not supported) |
| Runs on one binary for Linux (x86_64, ARM64) and Apple Silicon Macs, with a SQLite ledger in the project; or a server with Postgres in Docker Compose | Release assets of `v0.7.0`: `hivemind-linux-x86_64.tar.gz`, `hivemind-linux-arm64.tar.gz`, `hivemind-macos-arm64.tar.gz`; `scripts/install.sh` puts the binary in `~/.local/bin`; the [Quickstart](website/src/content/docs/getting-started/quickstart.mdx) ("Run a cell with Docker") for the Docker cell |
| AGPL-3.0; no hosted version; no account; nothing phones home | `LICENSE` in alexknips/loomtracer; CHANGELOG v0.7.0, Breaking: "the hosted open beta is gone", self-hosting is the only install path; the privacy review of 2026-09-25 found no telemetry in the v0.7.0 code |
| The install and connect commands on the page | Verified against the v0.7.0 release binary in a throwaway home on 2026-09-25 (site PR #8). Re-checked on 2026-10-01 with the `v0.7.0` binary and Claude Code 2.1.286 in a throwaway home: `claude mcp add hivemind -- hivemind mcp --agent-tool claude` exits 0 and `claude mcp list` shows the server connected. The install step now ends with `hivemind --version`, because the install re-run of 2026-09-29 found that `claude mcp add` also exits 0 with no binary on PATH and Claude Code only fails later ("ENOENT: Executable not found in $PATH"); the PATH fix is in the Quickstart ("If `hivemind` is not found"), which step 1 links since 2026-10-02 |
| `--agent-tool claude` files your agent's captures under Claude Code; without it they are filed under Codex (the Quickstart, MCP setup, the deck; the landing page's step 2 runs it) | `v0.7.0` `src/cli/args.rs`, `McpArgs`: `--agent-tool`, "Agent tool name used when MCP write calls omit actor_id"; `src/identity.rs` `default_agent_tool()` falls back to `codex`. Run on 2026-10-01 with the `v0.7.0` release binary over stdio, a capture with no `actor_id`: with the flag it is recorded as `agent:claude:mcp-<id>` in "claude agents' personal project"; without it, in `personal:agent:codex` (as the install re-run of 2026-09-29 found). `actor_id` is optional in the `capture_decision` schema. Codex 0.159.3 writes `args = ["mcp", "--agent-tool", "codex"]` for the MCP setup page's Codex line. A project `.mcp.json` server reads "Pending approval" in `claude mcp list` until approved (Claude Code 2.1.284 on 2026-09-29, 2.1.286 on 2026-10-01), as the Quickstart says |
| The deck's Claude Code screenshot shows a real session, and what it shows is in v0.7.0 (the landing page links the deck from "How to start" since 2026-10-01; since 2026-10-06 the deck shows one session, the capture, where it showed three) | `pitch-screens/README.md`: `hivemind` built from commit `881412f` of 2026-09-23, which is an ancestor of the `v0.7.0` tag (`git merge-base --is-ancestor 881412f v0.7.0`); each session a fresh Claude Code process; raw captures in `pitch-screens/captures/` |

### Stated limits (also claims)

| Claim | Evidence |
|---|---|
| "Held up" today means contested or replaced, not an outcome score | Status derivation on the Decision Graph page; no outcome scoring is in a release (the v0.6.0 scorer's deductions are not shown on the site by decision of 2026-09-21) |
| The capture plugins come from hivemind `master`, not from a release, and need the `hivemind` binary installed; with the `v0.7.0` binary they work: the Claude Code plugin's server connects and its captures are filed under Claude Code (Agent capture guide). The Claude Code plugin has five commands and one skill | Re-checked on 2026-10-01 in a throwaway home with only the `v0.7.0` release binary, Claude Code 2.1.286 and Codex 0.159.3 on PATH. `claude plugin marketplace add alexknips/hivemind` and `claude plugin install hivemind-capture@hivemind` installed plugin 0.1.1 from hivemind `master` at `7f6f0bc` (the fix merged on 2026-10-01, hivemind PR #177: the server and the capture script pass `--project-from-context` only when the installed binary lists it); `claude mcp list` shows `plugin:hivemind-capture:hivemind … ✔ Connected`; one `claude -p` capture through the plugin's `capture_decision` tool wrote all seven ledger events as `agent:claude:<session>`, filed under `personal:agent:claude`; the plugin's capture script exited 0 and its query script found the decision. Codex: `codex plugin marketplace add https://github.com/alexknips/hivemind.git` and `codex plugin add hivemind-capture@hivemind-plugins` installed 0.1.1; `codex mcp list` shows `hivemind` enabled with `--agent-tool codex`, and that command, started by hand, answered as hivemind 0.7.0 with 27 tools. Before the fix (the install re-run of 2026-09-29) the server failed with "unexpected argument '--project-from-context'" and the capture script exited 2. The commands (`capture`, `capture-decision`, `query-decisions`, `batch-capture`, `classify-queue`) and the one skill (`hivemind-capture`) are the files under `plugins/hivemind-capture/` at both `v0.7.0` and `master` |
| Loomtracer is early; no known outside users | Company state of week 39: three GitHub stars, no known outside users |
| Not only for engineering: any decision a person makes with their agents fits (a plan, a hire, a supplier, a verdict); running it today takes a developer's setup, self-hosting and an agent connected over MCP. Said in "Who it is for" on the landing page ("Not only for engineering: a plan, a hire, a supplier, a verdict", with the developer's-setup limit; under the hero until 2026-10-02, when the hero became one line), on the deck's "What it is" slide and in the opening lines of the Quickstart. "One person and their agents" names who it is for wherever the pages used to say "one engineer" | The founder's direction of 2026-09-29, recorded in the company's own decision record as decision-cd049fd7: "I have repeated many times hivemind is not just for engineering and I want the documentation to note this!" Nothing in the record is about code: its node types are a decision, its options, evidence and hypotheses, with the actors who proposed and accepted it (the [Decision Graph](website/src/content/docs/concepts/decision-graph.md) page). The limit: `v0.7.0` is self-hosted only, a binary or a Docker cell ([Quickstart](website/src/content/docs/getting-started/quickstart.mdx)), and agents reach it over MCP or the CLI ([MCP setup](website/src/content/docs/guides/mcp-setup.md)). "One person and their agents" is the founder's open default of the same day; the focus of 2026-09-06 limits the unit (one person, not teams or organisations), not the kind of decision |
| The founders and how to reach them: Jeff Miao, Co-founder · Design (github.com/TheChairmanMiao), and Alex Knips, Co-founder · Technology (github.com/alexknips); the landing page's "Talk to the founders" block and the footer, since 2026-10-07 | Names and roles as on the deck's last slide (site PR #24, by Jeff Miao); the GitHub handles and the request for the contact block from Alex on 2026-10-07. No email addresses are given |

## Coming next (built and merged, not yet in a release, or under way)

| Claim | Evidence, as of 2026-09-26 |
|---|---|
| A much simpler, decision-first UI: a decision list, newest first, as the start page; one decision's neighbourhood as the graph; arrows newer to older | All five children of the UI redesign are merged in the UI repository (design tokens, browser-mode tests, React Flow graph, decision page, decision list front door); from 2026-09-28 to 2026-10-08 the site's own `/demo/` ran it, read-only, over made-up example data (the site no longer serves a demo; see the demo row under the use cases section); it is not part of a hivemind release. Deck slide "Where it is": "Next: a much simpler, decision-first UI. The redesign is under way." |
| A quality profile on seven dimensions, each line naming the facts it was read from; not a grade | The dimensions are `docs/DECISION_SCORING.md` in alexknips/loomtracer; the engine that computes the profile merged to master on 2026-09-25 and `score_decision` returning it over the CLI and MCP on 2026-09-26, both after the tag; not in a release |
| Capture that runs all day inside the coding agent; pieces in the release, one-step setup not yet | CHANGELOG v0.7.0, Fixed: "Passive capture no longer drops the session"; Added: "Classification over HTTP and MCP" with a daily cap. The setup still takes the hook from the repository plus a classifier key or the keyless path; no single-step install exists |

## Planned (decided, not built)

| Claim | Evidence, as of 2026-09-26 |
|---|---|
| "Soon to come" (who it is for): teams on one shared record, not built yet (the landing page's words since 2026-10-02); the plan behind it: several people and their agents on one shared record, a view for the team lead across everyone's decisions, later one across the organisation | The founder's direction of 2026-09-28, in the review of the live page: "I rather want to explain: soon to come", replacing the "Not for, yet" block. The positioning in `vision/README.md` (company repository) is unchanged: one person and their agents first (the wording since 2026-09-29; it was "one engineer"). Nothing for teams is built or scheduled, and the copy says "not built yet" |
| A disagreement travels: re-examine items on dependents, with "N of M re-examined" visible | Product rule set on 2026-09-21; the feature is defined and blocked on grounding; nothing merged |
| Detecting two tracks that contradict each other with no recorded link | Deferred on 2026-09-21 until real parallel-track data exists; what shipped earlier is the measuring harness and gold cases, not the detector |
| Speed, consistency and flexibility across decisions, side by side, never one number | Named by the founder on 2026-09-25; a research brief defines the measures; no product work yet |
| The same agent work with and without Loomtracer, side by side | Planned since 2026-09-22; the design (task, prompts, run script, scoring) is done and a dry run of the arm without it ran on 2026-09-25; the run waits for the product to be fully in daily use. Deck slide "Where it is": "Then" |

## Comparison claims

| Claim | Evidence |
|---|---|
| A hand-kept DECISIONS.md goes stale after a reversal and the agent follows the old entry | The company's research brief of 2026-09-21 on what engineers do when an agent's decision goes wrong (public posts quoted in `vision/README.md` of the company repository: "the agent follows the dead one confidently") |
| Memory tools remember facts and preferences; Loomtracer is memory for decisions: the options that lost, the evidence, who decided | The landscape brief of 2026-09-21; positioning locked on 2026-09-22 ("memory, but for decisions") |
| Loomtracer does not claim to win on recall against memory tools, that anyone outside uses it, or that it makes decisions better | `vision/README.md`, "What we do not claim yet" |

## Use cases section of the landing page (`#showcase`)

One card per feature, in the order agreed on 2026-09-28 from the company's showcase draft
(`marketing/showcase.md` in the company repository, approved by the founder on 2026-09-26 with the
rule "no tracker ids, no changelog quotes, no internal names in the public copy"). Since 2026-10-01 a
card's example is its graph (the founder's review of 2026-09-30, "way too much text"): the prose examples
and the "In the demo" paragraphs were cut, and a demo link sits under four of the graphs. The examples
are illustrations, not recorded sessions. "Capture without typing anything" is left out:
the scheduled classification it needs is our own setup, not something a reader can install.
Until 2026-10-08 the rows also cited the site's own demo, decision by decision, and each demo link
opened the decision it named. Since then every demo link goes to the hosted demo's start page (the last
row), which shows its own example and none of these decisions, so no row cites a demo page.
Since 2026-09-29 the section opens with the anatomy of a decision and most cards carry their story as a
small graph; what the graphs claim is under "The graphs" below. Since 2026-10-02 the section holds only the
four cards that work today, with no status badge (the line under the heading says it once); the cards that
were coming next or planned are on the use cases page, and their rows are under "The use cases page's
drawings" below.

| Card | Status | Evidence |
|---|---|---|
| Change your mind, and the old decision says so: a replaced one reads superseded with what replaced it, a disputed one reads contested with both sides; nothing edited or deleted | Works today | CHANGELOG v0.7.0, Added, Fluent verbs (`supersede` and `disagree` take a description); Fixed, "Did it hold up?" works; status derived from edges on the [Decision Graph](website/src/content/docs/concepts/decision-graph.md) page. The card's graph follows the film (12 Angry Men): the drawn premise and its three refutations are the reasons the jury gives for not guilty (the second knife, the 41-second walk, the glasses), shortened into a few words per part |
| Who decided, a person or an agent, apart from who wrote it down; an agent deciding within what you handed it reads differently from one deciding alone; for seeing your own decisions, never a score of anyone | Works today | CHANGELOG v0.7.0, Added, Attribution: `--decided-by` (accepted by the human, `verify` shows both) and `--delegated-by` ("reads differently from an agent deciding alone"); Added, `why` answers why (`verify` shows the recorder and the decider as separate lines); Fixed, Attribution is honest. The graph colours decisions by who decided; the app does not colour its graph that way, and the card says the colours are the drawing's. Its one drawing (two steps until 2026-10-02) is coloured by who decided, and its caption says to look over what an agent decided on its own, then accept, dispute or replace it: `review` in cli.md (`--actor`, `--unreviewed-only`) |
| What a decision rests on: an earlier decision, something observed, an assumption, or a bet with a date to check; evidence refuting an assumption it rests on is said; a replaced premise makes it read stale; asking why shows the premise and whether it holds | Works today | CHANGELOG v0.7.0, Breaking, Capture and supersede require grounding (the four answers, `--bet` with `--check-by`); Added, "Answers show what a decision rests on" (each premise with its state; a superseded or rejected premise makes the decision stale; an overdue bet reads unchecked and does not flip "still holds"). Refuted assumption: `v0.7.0` `verify` gives the reason `premised_on_refuted`, rendered "assumption refuted" (`src/queries/outcome.rs`, `src/cli/render.rs`). The graph (a café) shows the limit honestly: a refuted assumption marks only the decisions resting on it directly (`query_refuted_premises`, the same on master); a decision further down the chain reads stale once the decision in between is replaced (`PremiseSuperseded`) |
| Ask "why did we…" in a fresh session: the reason, the options that lost and why, who decided, whether it still holds | Works today | CHANGELOG v0.7.0, Added, `why` answers why (the brief: rationale, chosen and rejected options, who decided, whether it still holds); deck slide "A new session asks why". The graph's option that lost carries its reason: `v0.7.0` records a description per option (`option_descriptions` on `decision.proposed`, CHANGELOG v0.7.0, Breaking, the v0.6.0 compatibility note) and `why` returns the rejected options |
| The demo: the hosted demo at https://loomtracer.vercel.app/demo, linked from the header, the footer, the hero's "Open the demo", the use cases page's closing buttons, and "Try the demo" under the anatomy and under four stories; no line on the site says what it shows | Works today (the demo) | Since 2026-10-08 every demo link goes to the hosted demo, which this repo does not build (the founder that day: "the demo should just link to https://loomtracer.vercel.app/demo", "not our own demo"). It answered 200 on 2026-10-08 and showed a read-only example labelled "Fictional pricing study", with none of the decisions the graphs draw, so every link goes to its start page. `website/vercel.json` redirects the site's old `/demo`, `/demo/*` and `/demo-preview/*` links there (permanent). Until then the site served its own demo at `/demo/`: the app itself, read-only, over made-up projects (TrailKeeper, Ridewell and the 12 Angry Men jury room), decided by the founder on 2026-09-26 (option d) |

## The use cases page's drawings (since 2026-10-02)

The three cards whose drawings show parts that come next or are planned moved here from the landing page,
each told once: the bet and the questions still waiting under "Coming next", the drifting projects under
"Planned" (the card was "Two tracks of your work, quietly diverging" on this page, and "Two projects,
drifting apart" on the landing). A card with a drawing spans the row. The drawings' marks are explained in
the page's legend.

| Card | Status | Evidence |
|---|---|---|
| An honest bet, called out: a bet with a check date and what would prove it wrong; after the date, asking about the decision shows the bet past its check date; evidence makes it read held or failed. Coming next: listed among what needs a look without being asked | Coming next (the card says the drawing marks the one part coming next; the rest, solid, works today) | Works today: CHANGELOG v0.7.0, Breaking, Capture and supersede require grounding (`--bet` with `--would-change-if` and `--check-by`); Added, "Answers show what a decision rests on" (a bet open, held or failed; an overdue bet reads "check by … (OVERDUE)" and `verify` lists it as unchecked, without flipping "still holds"); held is a supported bet and failed a refuted one (`src/queries/grounding.rs`). Coming next: CHANGELOG Unreleased on master, `scan_decision_quality` returns attention findings, "a bet past its check date" among them; not in a release. The example (a newsletter at 5 € a month) is made up. The card has no demo link |
| Questions nobody has decided yet: ask before anything answers, the question waits with its age until a decision answers it; a waiting list, no averages, nobody ranked (the graph's last step). Planned: the same list beside what is contested and what changed | Coming next | CHANGELOG Unreleased on master: `hivemind ask` (and MCP `request_decision`) records the question before any decision answers it; `emit decision.capture --answers` links the answer; `hivemind query get_waiting_requests` lists open requests oldest first with when and who asked; a decision answers a question (question nodes and the `ANSWERS` link are not in `v0.7.0`). Planned: the same changelog entry names the full waiting, contested and changed lists with per-decision times as a follow-up, not built. The example (a café's three questions) is made up. The card has no demo link |
| Two projects, drifting apart. Today: a decision resting on a replaced one reads stale, also across linked projects, and "what should I know" from one project also looks in the project it depends on. Planned (the card says the drawing marks it): catching a contradiction with no recorded link; the links between the projects that still hold, shown as a count. Re-examine items are their own card, "A disagreement travels" | Planned (the card says what works today) | Works today: CHANGELOG v0.7.0, Added, "Answers show what a decision rests on" and Projects, "What should I know" asks from one project (`part_of` and `depends_on`, one hop). Planned: as the first two rows of "Planned" above; the count is the founder's request of 2026-09-29 for these graphs, drawn as a count of links ("4 of 4"), never a percentage or a score (the quality profile's rule of no composite number). In the graph the count and the caught contradiction are dashed and marked planned; only the stale caching decision is drawn as working |

## The graphs (`#showcase`, since 2026-09-29)

The anatomy of a decision at the top of the section and four stories of one to three steps on its cards,
and three stories on the use cases page (`website/src/data/graph-stories.ts`), asked for by the founder on
2026-09-29. On 2026-10-02 the
founder asked for no part drawn only to show something off ("let's not invent the forward looking arrow
just to showcase something"), one slide where two showed the same graph, and plain words ("till" is gone,
and a sweep of the pages and the docs replaced "dearer", "regulars", "tick" and a few idioms).
So the anatomy no longer draws the question it answers or the earlier decision it follows from (each is
still in its own story: the questions still waiting, the café and who decided). Later that day "who
decided" became one coloured drawing with its key and one caption (the first step was the second without
the colours). What they claim beyond the card text:

| Claim | Status | Evidence |
|---|---|---|
| Drawn "the way the app draws them": one outline and hue per kind of node, arrows from the newer node to the older one | Works today (the drawing) | The outlines and radii are hivemind-ui `src/graph/NodeShape.tsx`, the hues its tokens (copied in `tokens.css`), the edge and canvas colours `RelationshipGraphExplorer.css`; the arrow rule is `docs/GRAPH_CONTRACT.md` in hivemind. The edge words are the contract's (`based on`, `weighs`, `chose`, `rests on`, `supports`, `refutes`, `follows from`, `answers`), except that `SUPERSEDES` is drawn as "replaces", the plain word the page uses; the app's graph reads "supersedes" |
| The anatomy: a decision with the options it weighs, the one it chose and the ones that lost with their reason, evidence with where it was seen, an assumption with evidence supporting it, who decided and who recorded it | Works today | CHANGELOG v0.7.0: grounding (`--rests-on-evidence` with `--evidence-source`, `--rests-on-assumption`), "Answers show what a decision rests on" (evidence with where it was seen; an assumption open, supported or refuted), `--decided-by` (Attribution), `option_descriptions` |
| The status marks: solid = works today; "COMING NEXT" above a part = merged, not released; dashed and "PLANNED" = decided, not built | Rule | The use cases page's legend and the rules at the top of this file. Planned parts drawn dashed: the drift story's count and caught contradiction. Part marked coming next: the bet story's "needs a look". Both stories are on the use cases page since 2026-10-02; nothing on the landing page carries a mark |
| The examples (a café, a newsletter, an API and its app, a service's settings, an ORM) are made up; the jury room steps follow the film | Rule | The jury story's refuted premise is drawn from the reasons the jury gives for not guilty in the film. Until 2026-10-08 the link under the anatomy and under four stories ("Open it in the demo") opened a matching decision in the site's own demo, with a line saying what it showed. Since then each reads "Try the demo", goes to the hosted demo's start page and says nothing about what it shows (the demo row under the use cases section) |

## How to keep this file true

- After a hivemind release: re-read the release's CHANGELOG section, move items from "coming next"
  to "works today" only when they are in the tag, and bump "Last checked".
- When the plan changes: change the copy and this file in the same pull request.
- The generated reference (`reference/mcp-tools.md`, the tool counts) is checked by CI against the
  latest release and is not covered here.
