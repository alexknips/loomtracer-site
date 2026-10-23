---
title: Human Review
description: Look over what your agents decided, and approve, disagree with or replace each decision, in the terminal.
---

Your agents record decisions as they work. `loomtracer review` lets you look over them afterwards,
one by one, in the terminal: no need to watch the agents live or read their transcripts.

## Look over a week of agent decisions

```bash
loomtracer review --actor 'agent:*' --since 7d --unreviewed-only
```

`--unreviewed-only` leaves out what you have already approved, disagreed with or replaced. You are
recorded as the reviewer ([Setting the actor](../../getting-started/quickstart/#setting-the-actor)).
Each decision is shown with its reason, options and what it rests on, and you choose:

| Key | Verb | What it records |
|-----|------|-----------------|
| `a` | approve | You accept the decision. |
| `d` | disagree | You dispute it, with a reason. A decision someone accepted now reads **contested**, with both sides kept. |
| `s` | supersede | You replace it: a new title, the reason, and the options. The old one reads **superseded** and points to the new one. |
| `n` | next | Nothing. It stays unreviewed. |
| `q` | quit | Stop here. |

A decision your agent records with a chosen option is accepted at once, by whoever decided it. Reviewing
it is still yours to do. Decisions imported from documents start as proposed until you approve them.

## The same verbs, outside the review

You can disagree with or replace any decision at any time. Describe it instead of quoting an id:

```bash
loomtracer disagree "sqlite for the ledger" --reason "Two people will write to it from their laptops"

loomtracer supersede "sqlite for the ledger" \
  --title "Use Postgres for the ledger" \
  --rationale "Two people write to it from their laptops, so one file on one machine no longer works" \
  --topic-keys storage --options postgres,sqlite --chose postgres \
  --rests-on-evidence "Two people write to the ledger from their laptops" --evidence-source "team chat, 2 Oct" \
  --binds "Every later write goes to one Postgres server" --undo-cost "Moving the data back to one file"
```

A description that matches more than one decision lists the candidates, numbered, and writes nothing;
pick one with `--pick <n>`. Like a new decision, a replacement must say what it rests on, what it
binds and what undoing it would cost. Nothing is
edited or deleted: the old decision stays in the record, and `loomtracer query chain` follows the
replacements back to the first one.

## Find what needs a look

```bash
# What your agents decided this week, one line each
loomtracer query recent --actor 'agent:*' --since 7d --summary

# Every disputed decision
loomtracer query search_decisions --status contested --summary
```
