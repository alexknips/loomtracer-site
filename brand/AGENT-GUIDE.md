# Loomtracer brand editing instructions

These instructions apply only to the Loomtracer project and its worktrees. Read the brand guide, tokens, and relevant artwork before editing. This package needs no private account connection or custom skill; existing repository instructions still govern unrelated work.

## Current baseline

- Current product name: **Loomtracer**. Loomtrace and Neurofilament are former names.
- Both current SVGs contain the Loomtracer wordmark and woven symbol, with a `214 × 169` canvas and identical geometry. Mono is literal black, distinct from palette Ink.
- The PNG still spells Loomtrace. Use it for the baseline palette and typography and qualitative breathing room, not current spelling or lockup proportions.
- The guide and tokens contain the exact defined values. Tokens are reference data, not an installed application theme.

## Making requested changes

1. Identify the affected rule, asset, or copy role and read the co-founder's requested change.
2. Apply an explicitly requested revision within its scope. Do not request permission already given. If a needed value is missing or sources conflict, ask a focused question or request design discretion for that choice; continue independent work. Do not require unrelated parts of the system to be completed first.
3. Preserve unrelated work. For a requested logo revision, retain the previous master in Git history or a clearly named archive and identify its replacement. For ordinary implementation, use the supplied SVG paths rather than redrawing them.
4. Update the affected guide, tokens, and artwork together. Preserve exact names and size units. If the PNG remains after a change, document which of its specifications are now historical.
5. Increment the brand version in the guide and tokens for confirmed visual-system changes. In `CHANGELOG.md` record the date, changes, reason, scope, and the human direction that selected them. Editorial corrections need no brand-version increase. Recompute the source SHA-256 entries for any changed asset bytes.
6. Review the result: render changed SVGs, inspect wordmark spelling and strand crossings, check proportional scaling and bounds, validate JSON and file references, and check fonts and contrast when implementing UI. Summarize changed files and unresolved choices.

## Undefined styles

Numeric clear space, minimum size, symbol-only and reversed logos, line height, tracking, responsive typography, font axes and fallbacks, semantic UI colors, components, spacing, interaction states, dark mode, and motion are not specified. Keep suggestions provisional until selected or covered by explicit design discretion. Existing CSS and framework defaults do not establish approved brand rules.

## Scope

Keep this system inside the Loomtracer project. Do not install it as global instructions or apply it to another product. Branding edits do not imply deployment, infrastructure changes, technical identifier migrations, or changes to hosted decision status.
