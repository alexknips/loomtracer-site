// Where the demo lives: Jeff's hosted demo. Every link on the site to the demo reads this one
// constant: the header, the footer, the buttons on the landing and use cases pages, and the
// "Try the demo" links under the graphs (Story.astro for the stories marked in graph-stories.ts,
// Anatomy.astro).
//
// The site serves no demo of its own. The hosted demo has none of the decisions the graphs draw,
// so every link goes to its start page and no link text says what it shows. Old links to the
// site's /demo/ redirect here (website/vercel.json).
export const DEMO_URL = 'https://loomtracer.vercel.app/demo';
