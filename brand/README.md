# Loomtracer preliminary brand guidelines

Brand version 2 · October 6, 2026 · Preliminary · Editable handoff

Loomtracer is the current product name, replacing Loomtrace and, before that, Neurofilament. This preliminary brand system applies only to the Loomtracer project in this repository and its worktrees, including its product UI, website, and project-owned communications. It does not apply to other products or establish a global style guide.

Use the supplied logo assets, palette, and type hierarchy for new brand work. Earlier generated concept boards and their palettes are exploration history; they are superseded by these supplied assets. Existing application styling is implementation evidence, not an additional brand specification.

## Sources and precedence

| Source | Governs |
| --- | --- |
| [Guidelines v1](<guidelines v1.png>) | Palette, typography, and qualitative safe-space guidance; its Loomtrace wordmark is outdated |
| [Color logo and wordmark](<logo wordmark color.svg>) | Exact color logo geometry, color placement, and lockup proportions |
| [Mono logo and wordmark](<logo wordmark mono.svg>) | Exact black logo geometry and lockup proportions |
| [Brand tokens](tokens.json) | A machine-readable transcription of the supplied values and explicitly identified conversions |

Explicit directions from the co-founder requesting the edit take precedence for that revision. Apply a requested brand change and record its scope in the change log; these preliminary rules are editable. For the current Loomtracer logo and wordmark, use the updated SVG geometry rather than tracing the PNG. The PNG retains the earlier Loomtrace name; it does not override the current spelling or lockup proportions. For palette and typography, use the PNG's printed specifications. This baseline guide and the tokens transcribe those sources. A confirmed revision must identify the rule or asset it replaces and update affected files together. An older reference image does not override an explicitly requested, documented revision. Resolve any remaining source conflict before applying the affected style.

![Original guidelines showing the earlier Loomtrace wordmark; palette and typography remain current](<guidelines v1.png>)

## Product naming and project scope

Write **Loomtracer**, with an initial capital L, in new or updated customer-facing copy. Use **Loomtrace** or **Neurofilament** when explaining the former names or quoting historical material. Retain existing technical identifiers as written.

Apply this guide in the Loomtracer project checkout where it is installed, whatever its local folder name. Brand edits do not automatically rename package names, database identifiers, connection names, URLs, or directories. Handle technical migrations as separate requested work.

Keep this guide and its agent instructions inside this repository. Do not install them in global skills, global agent instructions, another project's guide, or a cross-project inherited brand record. This package can be read and edited using its included files; no private account connection or custom agent skill is required.

## Logo assets

Both supplied SVGs contain the complete stacked woven symbol and Loomtracer wordmark. Each uses a `214 × 169` canvas and `viewBox="0 0 214 169"`. Scale proportionally at that aspect ratio. Their path geometry is identical; only the fills differ. The wordmark is outlined artwork and requires no font to display.

Use the color SVG for the supplied multicolor treatment and the mono SVG when a black treatment is required. The color asset uses Ink, Blue, Orange-red, and Yellow. The mono asset is literal black, `#000000`, rather than Ink `#332B32`; preserve that distinction. Both assets have transparent backgrounds.

Preserve the supplied paths, strand thicknesses, crossing gaps, corner geometry, color placement, and symbol-to-wordmark relationship. Do not stretch, redraw, retype the wordmark, recolor individual strands, add effects, or reconstruct a lockup from an older concept image. These source SVGs are the current logo masters. If explicitly asked to revise a logo, preserve the prior master in version history or an archive, then identify the replacement in the guide and tokens.

The PNG's red safe-space box is an annotation, not part of the logo or palette. It illustrates breathing room around the earlier Loomtrace lockup; do not copy its exact box proportions onto the wider Loomtracer artwork. The source supplies no numeric clear-space unit, so do not invent one or treat the SVG canvas as built-in safe space. A placement that requires an exact clearance must establish that value before implementation.

A minimum reproduction size, standalone symbol, favicon, horizontal lockup, and white/reversed logo are not supplied. Establish those variants when needed; do not silently crop or recolor a master to manufacture them.

## Color palette

| Reference name | Hex | Source label |
| --- | --- | --- |
| Ink | `#332B32` | Ink |
| Blue | `#1D90CD` | Color |
| Orange-red | `#E25432` | Color |
| Yellow | `#F3BA1E` | Color |
| Ivory | `#FDF8F4` | Ivory |

Blue, Orange-red, and Yellow are descriptive reference names for the three swatches labelled “Color” in the PNG. Use these exact hex values. The guide does not assign the accent colors to primary buttons, links, success, warnings, errors, graph states, or other UI semantics. Those mappings require a separate component or surface specification.

Black is retained in the supplied mono logo; it is not a sixth palette swatch. The red safe-space annotation is not a brand color.

## Typography

| Copy role | Family | Weight | Supplied size | Equivalent CSS size |
| --- | --- | --- | --- | --- |
| Headline | Fraunces | Semibold / `600` | `24pt` | `32px` |
| Subhead | Source Sans 3 | Semibold / `600` | `16pt` | `64/3px` ≈ `21.333px` |
| Body | Source Sans 3 | Regular / `400` | `12pt` | `16px` |

The point sizes are the source values. CSS equivalents use `1pt = 4/3px`; do not turn `24pt` into `24px` by dropping the unit. These are the supplied three reference treatments, not a complete responsive type scale. The [CSS unit relationship is described by W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Use actual Fraunces and Source Sans 3 fonts for copy. The `brand` folder contains outlined logo artwork, not font files. Confirm font loading when implementing a surface. Line height, tracking, responsive scaling, variable-font axes, and fallback families remain unspecified; the earlier exploration-board values do not fill these gaps.

## Contrast checks

These ratios are calculated from the supplied hex colors, not additional palette roles or proof of a complete accessibility review.

| Pair | Contrast ratio |
| --- | --- |
| Ink on Ivory | `12.99:1` |
| Blue on Ivory | `3.36:1` |
| Orange-red on Ivory | `3.59:1` |
| Yellow on Ivory | `1.68:1` |

Ink on Ivory supports readable normal-size text. Do not assume the three accents support normal-size text on Ivory, or that white labels on Blue or Orange-red meet the same requirement. WCAG AA uses a minimum `4.5:1` for ordinary text and `3:1` for qualifying large text; check the actual size, weight, and background. The logo exception does not extend to ordinary body copy or control labels. See [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Preserve the logo master rather than using these checks to recolor it.

## Applying and extending the system

Read this guide and the applicable source before creating or changing a Loomtracer surface. Use the supplied SVGs for logos and the exact palette and type values for the defined roles. Keep tokens scoped to Loomtracer; `tokens.json` is a reference file and is not automatically applied to the application.

This preliminary system does not yet define component shapes, spacing scales, borders, shadows, iconography, interaction states, dark mode, responsive layouts, motion, or semantic UI colors. Ask only for the specifications needed by the current task, or for explicit design discretion over those choices. Continue independent work while an affected choice is unresolved. Record subsequent confirmed rules here with their scope and in [the change log](../CHANGELOG.md). The co-founder can request revisions or grant design discretion for a specific choice. Keep explorations labeled as proposals until selected; do not promote an implementation guess into the guide.

Before completing brand work, compare the rendered result against the supplied assets. Check logo proportions and crossings, surrounding space, exact colors, loaded font families and weights, typography size units, and legibility at the intended size. Preserve the source assets, and label any separately authorized derivative clearly.

## Editing this handoff

Use [the agent workflow](AGENT-GUIDE.md) to keep the guide, tokens, and affected artwork consistent. All files are editable. The current values remain the baseline until an explicit revision replaces them.

For a confirmed visual change, update this guide and `tokens.json`, increment their brand version together, and add the date, reason, scope, and confirming direction to `../CHANGELOG.md`. Update artwork only if affected. Refresh `sources[].sha256` when an asset changes, and identify retained PNG specifications as historical where they have been superseded.
