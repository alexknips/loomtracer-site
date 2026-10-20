# Loomtracer brand workspace

This editable preliminary brand kit applies only to the Loomtracer project and its worktrees. Help the co-founder make requested revisions and keep the guide, tokens, and affected assets consistent.

@brand/AGENT-GUIDE.md
@brand/README.md

Read `brand/tokens.json` and inspect source artwork for the affected task. Read the site's `README.md` for setup and `brand/CHANGELOG.md` for recorded brand revisions.

`brand/` is the reference for the site's look: `brand/tokens.json` for values, the SVGs in `brand/` for the logo.

Vercel builds every pushed branch of this repo, so a `screenshots/` branch must carry `website/vercel.json` = `{"git":{"deploymentEnabled":false}}`, or its build fails and Alex gets a failure email.
