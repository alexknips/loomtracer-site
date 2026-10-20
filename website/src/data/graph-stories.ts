/*
 * The site's graphs: the anatomy of a decision and four stories on the landing page
 * (everything there works in v0.7.0), and three stories on the use cases page (the bet,
 * the questions still waiting, the two lanes), which carry the parts that come next or
 * are planned. A story has one to three steps. Every node is placed by hand in a
 * 340-wide frame (the anatomy's wide variant is 1000 wide); graph.ts turns them into
 * SVG. Arrows run from the newer node to the older one, and the edge words are the
 * product's (docs/GRAPH_CONTRACT.md in hivemind).
 *
 * Status, as CLAIMS.md at the repo root records it: solid parts work in v0.7.0; parts
 * marked COMING NEXT are merged, not yet released; dashed parts marked PLANNED are
 * decided, not built. The examples are made up; the café, the newsletter and the jury
 * room are there on purpose, since Loomtracer is not only for engineering.
 */
import type { GEdge, GFrame, GNode } from '../components/graphs/graph';

export interface Step {
  label: string;
  caption: string;
  alt: string;
  frame: GFrame;
}

export interface Story {
  id: string;
  title: string;
  steps: Step[];
  /** A "Try the demo" link under the story (to DEMO_URL in demo.ts). */
  demo?: boolean;
}

const W = 340;

/** A copy of `nodes` with some of them changed, for the next step of a story. */
function patch(nodes: GNode[], changes: Record<string, Partial<GNode>>): GNode[] {
  return nodes.map((n) => (changes[n.id] ? { ...n, ...changes[n.id] } : n));
}

function patchEdges(edges: GEdge[], changes: Record<string, Partial<GEdge>>): GEdge[] {
  return edges.map((e) => {
    const c = changes[`${e.from}>${e.to}`];
    return c ? { ...e, ...c } : e;
  });
}

// ── 0. The anatomy of a decision ─────────────────────────────────────────────

export interface Part {
  id: string;
  name: string;
  line: string;
}

export const anatomyParts: Part[] = [
  {
    id: 'decision',
    name: 'The decision',
    line: 'The decision: what was decided, in one line. Everything else on the graph links to it, and every arrow points from the newer part to the older one.',
  },
  {
    id: 'options',
    name: 'Options',
    line: 'The options it weighs: everything that was on the table. The chosen one has a check mark.',
  },
  {
    id: 'lost',
    name: 'The ones that lost',
    line: 'The options that lost keep the reason they lost, so nobody has to argue them all over again.',
  },
  {
    id: 'evidence',
    name: 'Evidence',
    line: 'Evidence it is based on: something observed, with where it was seen.',
  },
  {
    id: 'assumption',
    name: 'An assumption',
    line: 'An assumption it rests on. Evidence can support it, as the tasting does here, or refute it, and then the decision needs a look.',
  },
  {
    id: 'who',
    name: 'Who decided',
    line: 'Who decided: you or an agent, kept apart from who wrote it down. Here you decided, and your agent recorded it.',
  },
];

export const anatomyAlt =
  'The anatomy of a decision, drawn as a graph. In the middle, the decision "Buy our coffee beans from Roaster B", decided by you and recorded by your agent. ' +
  'It chose the option Roaster B and weighs two options that lost, each with its reason: stay with Roaster A, which costs 30% more from March, and roast our own, which needs a roaster and a person. ' +
  "It is based on evidence, Roaster A's new price list, 30% more from March, seen in their email on 12 February. " +
  'It rests on an assumption, customers will not mind the new beans, which a blind tasting supports: 9 of 12 customers chose B, seen at the café on 20 February. ' +
  'Every arrow points from the newer part to the older one.';

const aDecision = ['Buy our coffee beans', 'from Roaster B'];
const aBy = ['decided by you · recorded by your agent'];

export const anatomyWide: GFrame = {
  w: 1000,
  h: 340,
  nodes: [
    { id: 'd', kind: 'decision', x: 380, y: 160, w: 240, lines: aDecision, sub: aBy, state: 'lit', part: 'decision who' },
    { id: 'o1', kind: 'option', x: 206, y: 30, w: 130, lines: ['Roaster B'], chosen: true, part: 'options' },
    { id: 'o2', kind: 'option', x: 356, y: 30, w: 200, lines: ['Stay with Roaster A'], sub: ['lost: costs 30% more from March'], part: 'options lost' },
    { id: 'o3', kind: 'option', x: 576, y: 30, w: 218, lines: ['Roast our own'], sub: ['lost: needs a roaster and a person'], part: 'options lost' },
    { id: 'e1', kind: 'evidence', x: 50, y: 160, w: 226, lines: ["Roaster A's new price list:", '30% more from March'], sub: ['seen in: their email, 12 Feb'], part: 'evidence' },
    { id: 'h', kind: 'hypothesis', x: 700, y: 174, w: 250, lines: ["Customers won't mind the new beans"], part: 'assumption' },
    { id: 'e2', kind: 'evidence', x: 718, y: 262, w: 214, lines: ['Blind tasting: 9 of 12', 'customers chose B'], sub: ['seen at: the café, 20 Feb'], part: 'assumption' },
  ],
  edges: [
    { from: 'd', to: 'o1', label: 'chose', fromSide: 't', toSide: 'b', fromOff: -80, part: 'options' },
    { from: 'd', to: 'o2', label: 'weighs', fromSide: 't', toSide: 'b', fromOff: -10, part: 'options lost' },
    { from: 'd', to: 'o3', label: 'weighs', fromSide: 't', toSide: 'b', fromOff: 70, part: 'options lost' },
    { from: 'd', to: 'e1', label: 'based on', part: 'evidence' },
    { from: 'd', to: 'h', label: 'rests on', part: 'assumption' },
    { from: 'e2', to: 'h', label: 'supports', part: 'assumption' },
  ],
};

export const anatomyNarrow: GFrame = {
  w: W,
  h: 430,
  nodes: [
    { id: 'd', kind: 'decision', x: 10, y: 10, w: 320, lines: ['Buy our coffee beans from Roaster B'], sub: aBy, state: 'lit', part: 'decision who' },
    { id: 'o1', kind: 'option', x: 100, y: 70, w: 230, lines: ['Roaster B'], chosen: true, part: 'options' },
    { id: 'o2', kind: 'option', x: 100, y: 110, w: 230, lines: ['Stay with Roaster A'], sub: ['lost: costs 30% more from March'], part: 'options lost' },
    { id: 'o3', kind: 'option', x: 100, y: 164, w: 230, lines: ['Roast our own'], sub: ['lost: needs a roaster and a person'], part: 'options lost' },
    { id: 'e1', kind: 'evidence', x: 100, y: 220, w: 230, lines: ["Roaster A's new price list:", '30% more from March'], sub: ['seen in: their email, 12 Feb'], part: 'evidence' },
    { id: 'h', kind: 'hypothesis', x: 100, y: 292, w: 230, lines: ["Customers won't mind", 'the new beans'], part: 'assumption' },
    { id: 'e2', kind: 'evidence', x: 130, y: 362, w: 200, lines: ['Blind tasting: 9 of 12', 'customers chose B'], sub: ['seen at: the café, 20 Feb'], part: 'assumption' },
  ],
  edges: [
    ...(
      [
        ['o1', 'chose', 'options'],
        ['o2', 'weighs', 'options lost'],
        ['o3', 'weighs', 'options lost'],
        ['e1', 'based on', 'evidence'],
        ['h', 'rests on', 'assumption'],
      ] as const
    ).map(
      ([to, label, part]): GEdge => ({
        from: 'd',
        to,
        label,
        part,
        route: 'spine',
        fromSide: 'b',
        toSide: 'l',
        fromOff: -144,
      }),
    ),
    { from: 'e2', to: 'h', label: 'supports', fromSide: 't', toSide: 'b', toOff: 15, part: 'assumption' },
  ],
};

// ── 1. Revising a decision: the jury room (as the film tells it) ─────────────

const juryNodes: GNode[] = [
  { id: 'og', kind: 'option', x: 8, y: 24, w: 96, lines: ['Guilty'], chosen: true },
  { id: 'on', kind: 'option', x: 8, y: 62, w: 96, lines: ['Not guilty'] },
  { id: 'h', kind: 'hypothesis', x: 8, y: 110, w: 156, lines: ['The two witnesses', 'prove the boy did it'] },
  { id: 'd1', kind: 'decision', x: 206, y: 76, w: 126, lines: ['The first vote:', 'guilty, 11 to 1'], state: 'lit' },
];
const juryEdges: GEdge[] = [
  { from: 'd1', to: 'og', label: 'chose' },
  { from: 'd1', to: 'on', label: 'weighs' },
  { from: 'd1', to: 'h', label: 'rests on', toOff: -8 },
];
const juryEvidence: GNode[] = [
  { id: 'e1', kind: 'evidence', x: 206, y: 140, w: 126, lines: ['The knife is', 'not unique'] },
  { id: 'e2', kind: 'evidence', x: 206, y: 190, w: 126, lines: ['His walk took', '41 s, not 15'] },
  { id: 'e3', kind: 'evidence', x: 206, y: 240, w: 126, lines: ['She had no', 'glasses on'] },
];
const juryRefutes: GEdge[] = [
  { from: 'e1', to: 'h', label: 'refutes', toSide: 'b', toOff: 52 },
  { from: 'e2', to: 'h', label: 'refutes', toSide: 'b', toOff: 2 },
  { from: 'e3', to: 'h', label: 'refutes', toSide: 'b', toOff: -48 },
];

export const storyRevise: Story = {
  id: 'story-revise',
  title: 'Drawn: the jury changes its mind',
  steps: [
    {
      label: 'Before',
      caption:
        'The first vote, 11 to 1 for guilty, rests on one premise: the two witnesses prove the boy did it.',
      alt: 'A graph. The decision "The first vote: guilty, 11 to 1" chose the option Guilty, weighs the option Not guilty, and rests on the assumption "The two witnesses prove the boy did it".',
      frame: { w: W, h: 292, nodes: juryNodes, edges: juryEdges },
    },
    {
      label: 'What happened',
      caption:
        'Three pieces of evidence refute that premise. The vote resting on it now reads: assumption refuted.',
      alt: 'The same graph with three pieces of evidence added: the knife is not unique, his walk took 41 seconds, not 15, and she had no glasses on. Each refutes the assumption, which is marked refuted. The first vote is marked assumption refuted.',
      frame: {
        w: W,
        h: 292,
        nodes: [
          ...patch(juryNodes, {
            h: { state: 'refuted', badge: { text: 'refuted', tone: 'danger' } },
            d1: { state: 'look', badge: { text: 'assumption refuted', tone: 'warning' } },
          }),
          ...juryEvidence.map((n) => ({ ...n, state: 'lit' as const })),
        ],
        edges: [...juryEdges, ...juryRefutes],
      },
    },
    {
      label: 'After',
      caption:
        'The verdict, 12 to 0 for not guilty, replaces the first vote, which stays and reads superseded.',
      alt: 'A new decision, "The verdict: not guilty, 12 to 0", replaces the first vote. The first vote stays, greyed and marked superseded, still linked to its two options and to the refuted assumption, and the three pieces of evidence are still there.',
      frame: {
        w: W,
        h: 292,
        nodes: [
          ...patch(juryNodes, {
            h: { state: 'refuted', badge: { text: 'refuted', tone: 'danger' } },
            d1: { state: 'superseded', badge: { text: 'superseded', tone: 'neutral', align: 'start' } },
          }),
          ...juryEvidence,
          { id: 'd2', kind: 'decision', x: 206, y: 4, w: 126, lines: ['The verdict: not', 'guilty, 12 to 0'], state: 'lit' },
        ],
        edges: [
          ...juryEdges.map((e) => ({ ...e, tone: 'muted' as const })),
          ...juryRefutes,
          { from: 'd2', to: 'd1', label: 'replaces', fromSide: 'b', toSide: 't', fromOff: 22, toOff: 22 },
        ],
      },
    },
  ],
  demo: true,
};

// ── 6. Who decided: coloured by who made the call (one drawing) ─────────────

const whoNodes: GNode[] = [
  { id: 'd4', kind: 'decision', x: 8, y: 90, w: 100, lines: ['Store data in', 'Postgres'], sub: ['you decided'], who: 'you' },
  { id: 'd1', kind: 'decision', x: 178, y: 12, w: 154, lines: ['Pool of 20', 'connections'], sub: ['you decided'], who: 'you' },
  { id: 'd3', kind: 'decision', x: 178, y: 86, w: 154, lines: ['Log as JSON'], sub: ['an agent, within what', 'you handed it'], who: 'delegated' },
  {
    id: 'd2',
    kind: 'decision',
    x: 178,
    y: 160,
    w: 154,
    lines: ['Retry a failed call', '3 times'],
    sub: ['an agent, on its own'],
    who: 'agent',
    state: 'lit',
  },
];
const whoEdges: GEdge[] = [
  { from: 'd1', to: 'd4', label: 'follows from', toOff: -14 },
  { from: 'd3', to: 'd4', label: 'follows from', toOff: 0 },
  { from: 'd2', to: 'd4', label: 'follows from', toOff: 14 },
];

export const storyWho: Story = {
  id: 'story-who',
  title: 'Drawn: who decided what',
  steps: [
    {
      label: 'Coloured by who decided',
      caption:
        'Four decisions about one service, coloured by who made each call. The retry count stands out: an agent picked it on its own. Look it over, then accept, dispute or replace it.',
      alt: 'A graph of four decisions about one service. "Pool of 20 connections", "Log as JSON" and "Retry a failed call 3 times" each follow from "Store data in Postgres". Coloured by who decided: the pool size and Postgres, which you decided, in blue; the logging, which an agent decided within what you handed it, in teal; the retries, which an agent decided on its own, in violet with a heavier outline.',
      frame: { w: W, h: 230, nodes: whoNodes, edges: whoEdges },
    },
  ],
  demo: true,
};

// ── 5. One assumption falls: a café ─────────────────────────────────────────

const cafeNodes: GNode[] = [
  { id: 'h', kind: 'hypothesis', x: 8, y: 112, w: 124, lines: ['Most customers', 'come before 10'] },
  { id: 'd1', kind: 'decision', x: 176, y: 56, w: 150, lines: ['Open at 6:30'] },
  { id: 'd3', kind: 'decision', x: 176, y: 112, w: 150, lines: ['Hire a barista for', 'the early shift'] },
  { id: 'd2', kind: 'decision', x: 176, y: 170, w: 150, lines: ['Bake all the bread', 'by 5 am'] },
];
const cafeEdges: GEdge[] = [
  { from: 'd1', to: 'h', label: 'rests on', toOff: -10 },
  { from: 'd2', to: 'h', label: 'rests on', toOff: 10 },
  { from: 'd3', to: 'd1', label: 'follows from', fromSide: 't', toSide: 'b', fromOff: -40, toOff: -40 },
];
const cafeEvidence: GNode = {
  id: 'e',
  kind: 'evidence',
  x: 8,
  y: 206,
  w: 148,
  lines: ['60% of sales come', 'after noon'],
  sub: ["seen in: October's sales"],
};
const cafeRefutes: GEdge = { from: 'e', to: 'h', label: 'refutes', fromSide: 't', toSide: 'b', fromOff: -12 };
const refutedAssumption = { state: 'refuted' as const, badge: { text: 'refuted', tone: 'danger' as const } };
const lookRefuted = { state: 'look' as const, badge: { text: 'assumption refuted', tone: 'warning' as const } };

export const storyAssumption: Story = {
  id: 'story-assumption',
  title: 'Drawn: one assumption falls',
  steps: [
    {
      label: 'Before',
      caption:
        'You run a café. Opening at 6:30 and baking all the bread by 5 rest on one assumption: most customers come before 10.',
      alt: 'A graph. "Open at 6:30" and "Bake all the bread by 5 am" both rest on the assumption "Most customers come before 10". "Hire a barista for the early shift" follows from "Open at 6:30".',
      frame: { w: W, h: 272, nodes: cafeNodes, edges: cafeEdges },
    },
    {
      label: 'What happened',
      caption:
        'In October, 60% of sales came after noon. That refutes the assumption, and both decisions resting on it read: assumption refuted.',
      alt: "Evidence is added: 60% of sales come after noon, seen in October's sales. It refutes the assumption, which is marked refuted. Both decisions resting on it are marked assumption refuted. The barista decision is not marked yet.",
      frame: {
        w: W,
        h: 272,
        nodes: [
          ...patch(cafeNodes, { h: refutedAssumption, d1: lookRefuted, d2: lookRefuted }),
          { ...cafeEvidence, state: 'lit' },
        ],
        edges: [...cafeEdges, cafeRefutes],
      },
    },
    {
      label: 'After',
      caption:
        'You move the opening to 8. Hiring the early barista followed from 6:30, so it reads stale too. The baking still waits for a look.',
      alt: 'A new decision, "Open at 8", replaces "Open at 6:30", which is greyed and marked superseded. "Hire a barista for the early shift", which follows from it, is marked stale. "Bake all the bread by 5 am" is still marked assumption refuted.',
      frame: {
        w: W,
        h: 272,
        nodes: [
          ...patch(cafeNodes, {
            h: refutedAssumption,
            d1: { state: 'superseded', badge: { text: 'superseded', tone: 'neutral', align: 'start' } },
            d2: lookRefuted,
            d3: { state: 'look', badge: { text: 'stale', tone: 'warning' } },
          }),
          cafeEvidence,
          { id: 'd1n', kind: 'decision', x: 176, y: 4, w: 150, lines: ['Open at 8'], state: 'lit' },
        ],
        edges: [
          ...patchEdges(cafeEdges, {
            'd1>h': { tone: 'muted' },
            'd3>d1': { tone: 'warning' },
          }),
          cafeRefutes,
          { from: 'd1n', to: 'd1', label: 'replaces', fromSide: 'b', toSide: 't', fromOff: 40, toOff: 40 },
        ],
      },
    },
  ],
  demo: true,
};

// ── 4. An honest bet, called out: a newsletter ──────────────────────────────

const betNodes: GNode[] = [
  {
    id: 'b',
    kind: 'hypothesis',
    x: 8,
    y: 56,
    w: 152,
    lines: ['Readers will pay', '5 € a month'],
    sub: ['a bet · check by 1 Nov', 'wrong if under 100 pay'],
  },
  { id: 'd', kind: 'decision', x: 210, y: 70, w: 122, lines: ['5 € a month for', 'the newsletter'] },
];
const betEdges: GEdge[] = [{ from: 'd', to: 'b', label: 'rests on' }];

export const storyBet: Story = {
  id: 'story-bet',
  title: 'Drawn: a bet with a date',
  steps: [
    {
      label: 'Before',
      caption:
        'You start charging 5 € a month for your newsletter. Nothing shows yet that readers will pay, so the decision rests on a bet, with a date to check it and what would prove it wrong.',
      alt: 'A graph. The decision "5 € a month for the newsletter" rests on a bet, "Readers will pay 5 € a month", to be checked by 1 November, wrong if under 100 pay.',
      frame: { w: W, h: 214, nodes: betNodes, edges: betEdges },
    },
    {
      label: '1 November passes',
      caption:
        'Nothing was recorded either way. Ask about the decision and the bet reads past its check date. Coming next: Loomtracer lists it among what needs a look, without being asked.',
      alt: 'The same graph after 1 November. The bet is marked past its check date. The decision is marked needs a look, labelled coming next.',
      frame: {
        w: W,
        h: 214,
        nodes: patch(betNodes, {
          b: { state: 'look', badge: { text: 'past its check date', tone: 'warning' } },
          d: { state: 'look', badge: { text: 'needs a look', tone: 'warning' }, status: 'COMING NEXT' },
        }),
        edges: betEdges,
      },
    },
    {
      label: 'Evidence arrives',
      caption:
        '212 readers pay after a month. The evidence supports the bet, which reads held. Had it gone the other way, it would read failed.',
      alt: 'Evidence is added: 212 readers pay after a month, seen in the payments on 3 November. It supports the bet, which is marked held. The decision is marked still holds.',
      frame: {
        w: W,
        h: 214,
        nodes: [
          ...patch(betNodes, {
            b: { state: 'held', badge: { text: 'held', tone: 'success' } },
            d: { state: 'held', badge: { text: 'still holds', tone: 'success' } },
          }),
          {
            id: 'e',
            kind: 'evidence',
            x: 186,
            y: 150,
            w: 146,
            lines: ['212 readers pay', 'after a month'],
            sub: ['seen in: payments, 3 Nov'],
            state: 'lit',
          },
        ],
        edges: [...betEdges, { from: 'e', to: 'b', label: 'supports', toSide: 'b', toOff: 34 }],
      },
    },
  ],
};

// ── 7. The option that lost comes back ──────────────────────────────────────

const ormNodes: GNode[] = [
  { id: 'o1', kind: 'option', x: 8, y: 28, w: 170, lines: ['SQL by hand'], chosen: true },
  { id: 'o2', kind: 'option', x: 8, y: 70, w: 170, lines: ['Use an ORM'], sub: ['lost: it hid the', 'slow queries'] },
  { id: 'd', kind: 'decision', x: 226, y: 48, w: 106, lines: ['No ORM: write', 'SQL by hand'], sub: ['you decided'] },
];
const ormEdges: GEdge[] = [
  { from: 'd', to: 'o1', label: 'chose' },
  { from: 'd', to: 'o2', label: 'weighs' },
];

export const storyLostOption: Story = {
  id: 'story-lost-option',
  title: 'Drawn: the option that lost comes back',
  steps: [
    {
      label: 'Last month',
      caption:
        'You ruled out an ORM because it hid the slow queries. The option that lost keeps its reason.',
      alt: 'A graph. The decision "No ORM: write SQL by hand", which you decided, chose the option SQL by hand and weighs the option Use an ORM, which lost because it hid the slow queries.',
      frame: { w: W, h: 214, nodes: ormNodes, edges: ormEdges },
    },
    {
      label: 'Today',
      caption: 'A fresh session, with no chat history, suggests the option you ruled out.',
      alt: 'The same graph, and a speech bubble from a fresh session: "Shall we add an ORM?" It points at the option that lost.',
      frame: {
        w: W,
        h: 214,
        nodes: patch(ormNodes, { o2: { state: 'lit' } }),
        edges: ormEdges,
        says: [{ x: 22, y: 146, w: 204, lines: ['A fresh session: “Shall', 'we add an ORM?”'] }],
      },
    },
    {
      label: 'You ask why',
      caption:
        'The answer comes from the record: you decided, and nothing has replaced it.',
      alt: 'The same graph with the decision marked still holds and the option that lost highlighted, and the answer in a speech bubble: "You ruled the ORM out: it hid the slow queries. Nothing has replaced that."',
      frame: {
        w: W,
        h: 214,
        nodes: patch(ormNodes, {
          o1: { faded: true },
          o2: { state: 'lit' },
          d: { state: 'held', badge: { text: 'still holds', tone: 'success' } },
        }),
        edges: patchEdges(ormEdges, { 'd>o1': { faded: true } }),
        says: [{ x: 22, y: 146, w: 214, lines: ['“You ruled the ORM out: it hid', 'the slow queries. Nothing has', 'replaced that.”'] }],
      },
    },
  ],
  demo: true,
};

// ── 3. Decisions not being made: a café's open questions ────────────────────

const askNodes: GNode[] = [
  { id: 'q1', kind: 'question', x: 8, y: 34, w: 176, lines: ['Which flour supplier?'], sub: ['asked 23 Sep'] },
  { id: 'q3', kind: 'question', x: 8, y: 92, w: 176, lines: ['Raise the price', 'of a loaf?'], sub: ['asked 25 Sep'] },
  { id: 'q2', kind: 'question', x: 8, y: 164, w: 176, lines: ['Open on Sundays?'], sub: ['asked 27 Sep'] },
];
const askAnswer: GNode = { id: 'd', kind: 'decision', x: 232, y: 99, w: 100, lines: ['A loaf costs', '20 cents more'] };
const askEdge: GEdge = { from: 'd', to: 'q3', label: 'answers' };

export const storyWaiting: Story = {
  id: 'story-waiting',
  title: 'Drawn: questions still waiting',
  steps: [
    {
      label: 'You ask',
      caption:
        'Over a week you ask three questions about your café. Each is recorded when you ask it, before anything answers it.',
      alt: 'Three questions, each with the day it was asked: "Which flour supplier?" on 23 September, "Raise the price of a loaf?" on 25 September, "Open on Sundays?" on 27 September.',
      frame: { w: W, h: 216, nodes: askNodes },
    },
    {
      label: 'One is answered',
      caption: 'You decide a loaf costs 20 cents more. The decision answers that question, and the question reads answered.',
      alt: 'A decision is added, "A loaf costs 20 cents more". It answers the question about the price of a loaf, which is marked answered.',
      frame: {
        w: W,
        h: 216,
        nodes: [
          ...patch(askNodes, { q3: { badge: { text: 'answered', tone: 'success' } } }),
          { ...askAnswer, state: 'lit' },
        ],
        edges: [askEdge],
      },
    },
    {
      label: 'What is still waiting',
      caption:
        'On 29 September the waiting list shows the two open questions, oldest first, each with its age. A list, not a grade: no averages, and nobody is ranked.',
      alt: 'The waiting list on 29 September, oldest first: "Which flour supplier?", asked 6 days ago and waiting, and "Open on Sundays?", asked 2 days ago and waiting. The answered question and its decision are faded.',
      frame: {
        w: W,
        h: 216,
        nodes: [
          ...patch(askNodes, {
            q1: { state: 'lit', badge: { text: 'asked 6 days ago · waiting', tone: 'neutral' } },
            q3: { faded: true },
            q2: { state: 'lit', badge: { text: 'asked 2 days ago · waiting', tone: 'neutral' } },
          }),
          { ...askAnswer, faded: true },
        ],
        edges: [{ ...askEdge, faded: true }],
        notes: [{ x: 10, y: 15, text: 'WAITING, OLDEST FIRST', kind: 'eyebrow' }],
      },
    },
  ],
};

// ── 2. Two lanes drifting apart: an API and its mobile app ──────────────────

const laneNodes: GNode[] = [
  { id: 'a1', kind: 'decision', x: 8, y: 86, w: 136, lines: ['Record ids', 'never change'] },
  { id: 'a3', kind: 'decision', x: 8, y: 138, w: 136, lines: ['Every record', 'has a version'] },
  { id: 'a2', kind: 'decision', x: 8, y: 190, w: 136, lines: ['The API rounds', 'prices'] },
  { id: 'm1', kind: 'decision', x: 196, y: 112, w: 136, lines: ['Cache records', 'by id'] },
  { id: 'm3', kind: 'decision', x: 196, y: 164, w: 136, lines: ['Cart total from', 'the sent prices'] },
  { id: 'm2', kind: 'decision', x: 196, y: 216, w: 136, lines: ['Show prices', 'as sent'] },
];
const laneEdges: GEdge[] = [
  { from: 'm1', to: 'a1', label: 'rests on' },
  { from: 'm1', to: 'a3', label: 'rests on' },
  { from: 'm3', to: 'a2', label: 'rests on', toOff: -8 },
  { from: 'm2', to: 'a2', label: 'rests on', toOff: 9 },
];
const laneNotes = [
  { x: 10, y: 16, text: 'API', kind: 'eyebrow' as const },
  { x: 198, y: 16, text: 'MOBILE APP', kind: 'eyebrow' as const },
];
function laneCount(n: number) {
  return {
    boxes: [{ x: 8, y: 336, w: 324, h: 26, dashed: true }],
    notes: [
      ...laneNotes,
      { x: 16, y: 352, text: 'PLANNED', kind: 'eyebrow' as const },
      { x: 64, y: 353, text: `${n} of 4 links between the lanes hold`, kind: 'count' as const },
    ],
  };
}

export const storyDrift: Story = {
  id: 'story-drift',
  title: 'Drawn: two lanes drifting apart',
  steps: [
    {
      label: 'Aligned',
      caption:
        'Your agents run two lanes, the API and its mobile app. The app’s decisions rest on the API’s in four places. Those links are the alignment: 4 of 4 hold.',
      alt: 'Two lanes of decisions. In the API: record ids never change, every record has a version, the API rounds prices. In the mobile app: cache records by id rests on the first two; cart total from the sent prices and show prices as sent rest on the API rounding prices. A planned count below reads 4 of 4 links between the lanes hold.',
      frame: { w: W, h: 370, nodes: laneNodes, edges: laneEdges, ...laneCount(4) },
    },
    {
      label: 'One lane moves',
      caption:
        'The API lane merges duplicate records, replacing "record ids never change". The app’s caching decision rested on it, so it reads stale. 3 of 4 links hold.',
      alt: 'The API adds "Merge duplicates; ids can change", which replaces "Record ids never change", now greyed and marked superseded. The mobile app’s "Cache records by id" is marked stale. The planned count reads 3 of 4.',
      frame: {
        w: W,
        h: 370,
        nodes: [
          ...patch(laneNodes, {
            a1: { state: 'superseded', badge: { text: 'superseded', tone: 'neutral', align: 'start' } },
            m1: { state: 'look', badge: { text: 'stale', tone: 'warning' } },
          }),
          { id: 'a1n', kind: 'decision', x: 8, y: 22, w: 136, lines: ['Merge duplicates;', 'ids can change'], state: 'lit' },
        ],
        edges: [
          ...patchEdges(laneEdges, { 'm1>a1': { tone: 'warning' } }),
          { from: 'a1n', to: 'a1', label: 'replaces', fromSide: 'b', toSide: 't', fromOff: 30, toOff: 30 },
        ],
        ...laneCount(3),
      },
    },
    {
      label: 'The lanes contradict',
      caption:
        'Later the app rounds prices on the phone, replacing "show prices as sent", with no link to the API’s rounding. The lanes now contradict each other, and 2 of 4 links hold. Catching that, and showing the count, are planned.',
      alt: 'The mobile app adds "Round prices on the phone", which replaces "Show prices as sent", now greyed and marked superseded. A dashed red line marked planned joins it to "The API rounds prices": they contradict each other, with no recorded link. The planned count reads 2 of 4.',
      frame: {
        w: W,
        h: 370,
        nodes: [
          ...patch(laneNodes, {
            a1: { state: 'superseded', badge: { text: 'superseded', tone: 'neutral', align: 'start' } },
            m1: { state: 'look', badge: { text: 'stale', tone: 'warning' } },
            m2: { state: 'superseded', badge: { text: 'superseded', tone: 'neutral' } },
          }),
          { id: 'a1n', kind: 'decision', x: 8, y: 22, w: 136, lines: ['Merge duplicates;', 'ids can change'] },
          { id: 'm2n', kind: 'decision', x: 196, y: 282, w: 136, lines: ['Round prices', 'on the phone'], state: 'lit' },
        ],
        edges: [
          ...patchEdges(laneEdges, { 'm1>a1': { tone: 'warning' }, 'm2>a2': { tone: 'muted' } }),
          { from: 'a1n', to: 'a1', label: 'replaces', fromSide: 'b', toSide: 't', fromOff: 30, toOff: 30 },
          { from: 'm2n', to: 'm2', label: 'replaces', fromSide: 't', toSide: 'b' },
          {
            from: 'm2n',
            to: 'a2',
            label: 'contradicts, no link',
            bare: true,
            planned: true,
            tone: 'danger',
            toSide: 'b',
            labelAt: 'mid',
            labelDy: 12,
          },
        ],
        boxes: laneCount(2).boxes,
        notes: [...laneCount(2).notes, { x: 40, y: 282, text: 'PLANNED', kind: 'eyebrow' }],
      },
    },
  ],
};
