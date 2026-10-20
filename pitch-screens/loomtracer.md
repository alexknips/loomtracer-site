# Loomtracer B4SF pitch

Five slides adapted from Alex's original pitch and refined by Jeff: introduction, problem, three-stage decision flow, Decision Metrics (seven dimensions of decision quality and who decided), and invitation with QR code.

- [PDF preview](loomtracer-pitch.pdf)
- [Contact sheet](loomtracer-pitch.png)
- Editable deck: `website/src/pages/pitch/index.astro`
- Presenter view: `website/src/pages/pitch/presenter.astro`
- Script and source notes: `website/src/data/loomtracer-pitch.ts`

## Run and review

From `website/`, run `npm ci`, `npm run build`, then `npm run preview`. Open `/pitch/` on the preview server. The presenter script and manual rehearsal timer are at `/pitch/presenter/`.

Left/right arrows, Page Up/Down, Home/End and Space navigate on desktop; F requests full screen. Narrow screens stack the slides and allow horizontal scrolling inside the diagram. Presenter selection synchronizes with the audience window; the timer never advances slides.

The draft has about 125 spoken words, about 58 seconds. Slide 4, Decision Metrics (2026-10-07), asks "Are you making the decisions that matter?": seven tiles, one per dimension of the decision-quality profile, each with its question and no composite score, beside who decided in our own project (11 by a person, 40 by agents, counted 7 October 2026, our own record and not a benchmark). Its footer says what is there today (the profile and who decided) and what is coming (which decisions carry the most impact). Its sources are in the presenter notes. Rehearse aloud before setting the final timing.

The presenter script and source notes are intentionally shareable. Private conversation prompts and follow-up tally templates are excluded. The presenter route is not access-controlled.

## Assets and claims

The supplied Loomtracer stacked SVG is unchanged. Palette: Ink #332B32, Ivory #FDF8F4, Blue #1D90CD, Orange-red #E25432, Yellow #F3BA1E. Fraunces 600 headlines; Source Sans 3 400/600 body and subheads. Font licenses are in `website/public/pitch/fonts/`.

The illustrative diagram has three stages: Divide work, Evidence, and Ratify decisions. Three options produce Artifact 1, Artifact 2, and Artifact 3; people ratify the resulting decision. The headline is “Track and analyze decision making.” Arrows trace the decision back through its evidence to the explored options. It does not claim automatic orchestration or measured outcomes.

The displayed URL and QR code both target `https://www.loomtracer.ai`, a user-supplied placeholder. The SVG QR was generated with qrcode 1.5.4, error correction Q, a four-module quiet zone, and the brand Ink/Ivory palette. Independent raster decoding verified the exact payload. This does not verify that the website is live.

The former product screenshots are no longer shown on slide 4. The original Claude Code capture remains in this repository with [its original provenance](README.md).

Astro is unchanged. Since 2026-10-08 the site is served from the root of https://loomtracer.ai, on Vercel: a pull request gets a Vercel preview, and the site publishes after changes reach `main`.
