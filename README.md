# loomtracer-site

The Loomtracer website: the landing page, the docs, the pitch deck (`/pitch/`) and the use cases
(`/use-cases/`). The demo is not here: every demo link goes to the hosted demo,
https://loomtracer.vercel.app/demo.

**Live:** https://loomtracer.ai, on Vercel

The product is Loomtracer. Its code lives in [alexknips/loomtracer](https://github.com/alexknips/loomtracer),
and its command-line tool is still called `hivemind`: the site keeps that name in every command,
install step and tool name. This repo, alexknips/loomtracer-site, holds only the site.

## Layout

```
website/                  Astro + Starlight site
  src/pages/index.astro   landing page
  src/pages/use-cases.astro  use cases, on the landing page's header, footer and cards
  src/pages/pitch/        Loomtracer pitch deck and presenter script (own layout and brand); assets in public/pitch/
  src/components/         the header, footer and colour-scheme script the pages above share
  src/data/demo.ts        the hosted demo's address: every link to the demo reads it
  src/data/founders.ts    the founders on the landing page and in the footer
  src/styles/tokens.css   design tokens: Loomtracer's brand (the deck's ink, ivory, blue, orange, yellow; Fraunces and
                          Source Sans 3) on the app's token names (hivemind-ui src/styles/tokens.css); graph hues are the app's
  src/assets/logo-*.svg   the logo for light and dark (the deck's mark, threads shortened, beside its wordmark)
  src/content/docs/       the docs
  vercel.json             redirects: the old /demo/ links go to the hosted demo
pitch-screens/            source captures plus the Loomtracer PDF and contact-sheet preview
CLAIMS.md                 every claim on the landing and use cases pages, with its evidence (release, changelog section, plan)
.github/workflows/
  reference-docs.yml          fail if the docs drift from the latest hivemind release
  regenerate-reference.yml    regenerate the generated docs from that release, commit
.github/scripts/
  commit-generated-reference.sh   commits only what the generator owns
```

The site stays under `website/` because hivemind's reference generator reads
`website/src/...` paths relative to its working directory.

## Run it locally

```sh
cd website
npm ci
npm run dev        # http://localhost:4321/
npm run build      # static output in website/dist/
```

## The reference follows the latest hivemind release

The site documents the latest hivemind **release**, not master: master's new flags and tools
would advertise what nobody can install yet.

`reference-docs.yml` resolves the latest release tag
(`gh api repos/alexknips/loomtracer/releases/latest`), checks out `alexknips/loomtracer` at it,
builds its `generate-reference` binary and runs `--check` from this repo's root. It fails if
`reference/mcp-tools.md`, the tool counts in `guides/mcp-setup.md` and on the homepage, the
"Available tools" table in `guides/mcp-setup.md`, or the subcommand names in `reference/cli.md`
drift from that release. It runs on every push and pull request, and daily.

`regenerate-reference.yml` regenerates the generated parts from the same tag every six hours
and on manual dispatch (Actions -> "Regenerate reference docs" -> Run workflow, which is the
thing to do right after a release), commits the change to `main`, then runs the check on the
new `main`; Vercel deploys that push like any other. It only ever commits what the generator writes: `reference/mcp-tools.md` as a
whole, and the digits of the "N tools" mentions in `guides/mcp-setup.md` and
`src/pages/index.astro`. `.github/scripts/commit-generated-reference.sh` refuses anything else.

Hand-written, and updated by hand at release time: `reference/cli.md` and the "Available
tools" table in `guides/mcp-setup.md`. When a release adds a tool, the check stays red on
`main` until that table row (and any `cli.md` section) is written. That red is the alarm, not
a fault in the job.

To regenerate locally, with hivemind checked out next to this repo at the release tag:

```sh
cargo run --manifest-path ../hivemind/Cargo.toml --bin generate-reference
```

## The address

The site is served at https://loomtracer.ai/, on Vercel (www.loomtracer.ai redirects there). The
Vercel project `loomtracer-site` (framework Astro, root directory `website`, production branch
`main`) deploys every push to `main` and builds a preview of every pull request; Vercel's bot posts
the preview URL on the pull request. No GitHub workflow deploys the site.

One line sets the address: `siteUrl` in `website/astro.config.mjs`. Every internal link reads the
base path from it.

## The demo

The demo is Jeff's hosted demo, https://loomtracer.vercel.app/demo; this repo builds no demo of
its own. Every link on the site to the demo reads one constant, `DEMO_URL` in
`website/src/data/demo.ts`: the header, the footer, the buttons on the landing and use cases pages,
and the "Try the demo" links under the graphs. The hosted demo shows its own example, none of the
decisions the graphs draw, so every link goes to its start page and no link text says what it shows.

Until 2026-10-08 the site served its own copy at `/demo/` (a read-only build of the app over
made-up example data). `website/vercel.json` sends the old links, `/demo`, anything under `/demo/`
and `/demo-preview/`, to the hosted demo with a permanent redirect.

## Contact

Loomtracer's founders, on GitHub:

- **Jeff Miao**, Co-founder · Design: https://github.com/TheChairmanMiao
- **Alex Knips**, Co-founder · Technology: https://github.com/alexknips

## License

AGPL-3.0, the same as Loomtracer's code in alexknips/loomtracer. See [LICENSE](LICENSE).
