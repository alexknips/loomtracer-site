---
title: How it works
description: The record is never edited, status follows from later decisions, every decision says who decided and what it rests on, and your ledger stays in ./loomtracer.
---

## The record is never edited

Everything Loomtracer knows is a list of entries: a decision recorded, accepted, disputed or replaced, a
piece of evidence, an assumption. Each entry is added once and never changed or deleted. To change your
mind, you record a new decision that replaces the old one. The old one stays, and you can follow the
chain of replacements back to the first decision.

## Status follows from later decisions

Nobody sets a decision's status by hand. It follows from what was recorded after it: **proposed** until
someone accepts it, **accepted**, **contested** when one person accepted it and another disputed it, or
**superseded** when a newer decision replaces it. A replaced decision reads superseded the moment its
replacement is recorded; nobody has to remember to update it.

"Held up" means just that: whether a decision is contested or replaced. It is not a score. The
[Decision Graph](../decision-graph/#status-derivation) page has the exact rules.

## Every decision says who decided

Every entry says who wrote it: a person (`human:alice`), an agent (`agent:claude:<id>`) or a system
(`system:ci`). A decision also says who decided, apart from who wrote it down: when your agent records a
call you made, you decided and the agent recorded it. Writes are never anonymous;
[Setting the actor](../../getting-started/quickstart/#setting-the-actor) shows how the terminal and your
agent name themselves.

An agent's decision has the same shape as yours and counts the same, so you can look over it, accept it,
dispute it or replace it, with the same verbs ([Human Review](../../guides/human-review/)).

## Every decision says what it rests on

A decision names at least one thing it rests on: an earlier decision, something observed (with where it
was seen), an assumption, or a bet with a date to check. Loomtracer refuses a decision that names nothing.
That is how it can tell you later whether the decision still holds: when evidence refutes an assumption,
the decisions resting on it read "assumption refuted", and when an earlier decision is replaced, the
decisions resting on it read stale.

## Your ledger stays in ./loomtracer

On your machine, the record is one SQLite file in your project, `./loomtracer/ledger.sqlite`. There is no
account and nothing phones home. A [self-hosted cell](../../getting-started/quickstart/#run-a-cell-with-docker)
keeps it in its own Postgres, separately for each tenant. To read it without Loomtracer, export it as
Markdown files:

```bash
loomtracer export --format markdown --out ./decisions/
```
