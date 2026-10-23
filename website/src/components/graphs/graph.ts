/*
 * The landing page's small decision graphs: types and geometry.
 *
 * They are drawn in the app's own language (hivemind-ui, src/graph/NodeShape.tsx and
 * RelationshipGraphExplorer.css): one outline per kind of node, the kind's hue from the
 * tokens, the title in the page's text colour, grey edges whose words sit just behind the
 * arrowhead, and every arrow running from the newer node to the older one
 * (docs/GRAPH_CONTRACT.md in loomtracer). Frames are placed by hand; this file turns a
 * frame's description into SVG geometry, so Frame.astro only has to print it.
 */

export type Kind = 'decision' | 'option' | 'evidence' | 'hypothesis' | 'question';
export type Tone = 'neutral' | 'warning' | 'danger' | 'success';
export type Side = 'l' | 'r' | 't' | 'b';

export interface GNode {
  id: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  /** The title, one string per line (lines are broken by hand, so they always fit). */
  lines: string[];
  /** Muted lines under the title: who decided, where evidence was seen, why an option lost. */
  sub?: string[];
  /** The option that was chosen: a tick before the title, as in the app. */
  chosen?: boolean;
  /** superseded: greyed. look: needs a look (stale, refuted premise, past its date). */
  state?: 'superseded' | 'look' | 'refuted' | 'held' | 'lit';
  /** A status badge on the node's top edge, as the app shows a decision's status. */
  badge?: { text: string; tone: Tone; align?: 'start' | 'end' };
  /** Not built yet: dashed, with its status word above it. */
  planned?: boolean;
  /** "Planned" or "Coming next", in the page's eyebrow type above the node. */
  status?: string;
  /** Story 6: painted by who decided instead of by kind. */
  who?: 'you' | 'delegated' | 'agent';
  /** Faded back, so the rest of the frame reads first. */
  faded?: boolean;
  /** The anatomy's hover parts (space-separated). */
  part?: string;
}

export interface GEdge {
  /** The newer node: the arrow starts here. */
  from: string;
  /** The older node: the arrowhead lands here. */
  to: string;
  label?: string;
  planned?: boolean;
  /** A line between two nodes that is not a recorded link (no arrowhead). */
  bare?: boolean;
  tone?: 'default' | 'muted' | 'warning' | 'danger';
  fromSide?: Side;
  toSide?: Side;
  /** Slide the start or end along its side (px from the side's middle). */
  fromOff?: number;
  toOff?: number;
  /** Where the words go: just behind the arrowhead (default) or at the middle. */
  labelAt?: 'end' | 'mid';
  labelDx?: number;
  labelDy?: number;
  /** spine: straight down from the start, then a short turn into the node's left side
      (the phone layout of the anatomy, where every part hangs off one line). */
  route?: 'spine';
  faded?: boolean;
  part?: string;
}

export interface GNote {
  x: number;
  y: number;
  text: string;
  kind?: 'eyebrow' | 'muted' | 'count';
  anchor?: 'start' | 'middle' | 'end';
  part?: string;
}

/** A dashed or plain box behind a group (a lane, a planned count). */
export interface GBox {
  x: number;
  y: number;
  w: number;
  h: number;
  dashed?: boolean;
  part?: string;
}

/** A speech bubble: something said in a session, not a node of the graph. */
export interface GSay {
  x: number;
  y: number;
  w: number;
  lines: string[];
}

export interface GFrame {
  w: number;
  h: number;
  nodes: GNode[];
  edges?: GEdge[];
  notes?: GNote[];
  boxes?: GBox[];
  says?: GSay[];
}

// ── Type metrics (viewBox units; frames render close to 1:1) ────────────────

export const T = {
  title: 11.5,
  titleLh: 14.5,
  sub: 10,
  subLh: 13,
  padY: 7,
  label: 9.5,
  badge: 9,
};

/** A rough width at a size, measured on Inter: enough to size a badge or a label's halo. The site's
 *  Source Sans 3 is narrower, so it errs wide. */
export function textWidth(s: string, size: number): number {
  let em = 0;
  for (const ch of s) {
    if ('ilj.,:;|!\'’ '.includes(ch)) em += 0.3;
    else if ('mwMW@%'.includes(ch)) em += 0.85;
    else if (ch >= 'A' && ch <= 'Z') em += 0.66;
    else if (ch >= '0' && ch <= '9') em += 0.58;
    else em += 0.54;
  }
  return em * size;
}

export function nodeHeight(n: GNode): number {
  const sub = n.sub?.length ?? 0;
  return T.padY * 2 + n.lines.length * T.titleLh + (sub ? sub * T.subLh + 1 : 0);
}

/** Horizontal padding: kinds whose outline cuts into the box keep text clear of it. */
export function padX(kind: Kind): number {
  return kind === 'evidence' || kind === 'hypothesis' ? 14 : kind === 'question' ? 10 : 10;
}

/** The kind's outline, as hivemind-ui NodeShape draws it (same cuts and radii). */
export function outline(n: GNode, h: number): { d?: string; rx?: number } {
  const x0 = n.x;
  const y0 = n.y;
  const x1 = n.x + n.w;
  const y1 = n.y + h;
  const cut = Math.min(12, h / 2);
  switch (n.kind) {
    case 'evidence':
      return { d: `M${x0 + cut},${y0} H${x1 - cut} L${x1},${y0 + h / 2} L${x1 - cut},${y1} H${x0 + cut} L${x0},${y0 + h / 2} Z` };
    case 'hypothesis': {
      const skew = Math.min(10, h / 3);
      return { d: `M${x0 + skew},${y0} H${x1} L${x1 - skew},${y1} H${x0} Z` };
    }
    case 'question': {
      const tip = Math.min(14, n.w * 0.1);
      return { d: `M${x0},${y0} H${x1 - tip} L${x1},${y0 + h / 2} L${x1 - tip},${y1} H${x0} Z` };
    }
    case 'option':
      return { rx: h / 2 };
    default:
      return { rx: Math.min(8, h / 4) };
  }
}

// ── Edges ───────────────────────────────────────────────────────────────────

interface Anchor {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

function anchorOf(n: GNode, side: Side, off = 0): Anchor {
  const h = nodeHeight(n);
  const cx = n.x + n.w / 2;
  const cy = n.y + h / 2;
  // How far a slanted or pointed side sits inside the box at this height.
  const inset = (dy: number): { l: number; r: number } => {
    const t = Math.min(1, Math.abs(dy) / (h / 2));
    if (n.kind === 'evidence') {
      const cut = Math.min(12, h / 2);
      return { l: cut * t, r: cut * t };
    }
    if (n.kind === 'hypothesis') {
      const skew = Math.min(10, h / 3);
      const f = (dy + h / 2) / h; // 0 at the top, 1 at the bottom
      return { l: skew * (1 - f), r: skew * f };
    }
    if (n.kind === 'question') {
      const tip = Math.min(14, n.w * 0.1);
      return { l: 0, r: tip * t };
    }
    if (n.kind === 'option') {
      const r = h / 2;
      const k = r - Math.sqrt(Math.max(0, r * r - dy * dy));
      return { l: k, r: k };
    }
    return { l: 0, r: 0 };
  };
  switch (side) {
    case 'l':
      return { x: n.x + inset(off).l, y: cy + off, nx: -1, ny: 0 };
    case 'r':
      return { x: n.x + n.w - inset(off).r, y: cy + off, nx: 1, ny: 0 };
    case 't':
      return { x: cx + off, y: n.y, nx: 0, ny: -1 };
    default:
      return { x: cx + off, y: n.y + h, nx: 0, ny: 1 };
  }
}

function sidesFor(a: GNode, b: GNode): [Side, Side] {
  const ha = nodeHeight(a);
  const hb = nodeHeight(b);
  if (b.x + b.w <= a.x) return ['l', 'r'];
  if (b.x >= a.x + a.w) return ['r', 'l'];
  if (b.y + hb <= a.y) return ['t', 'b'];
  if (b.y >= a.y + ha) return ['b', 't'];
  return ['l', 'r'];
}

export interface EdgeGeom {
  d: string;
  head?: string;
  label?: { x: number; y: number; anchor: 'start' | 'middle' | 'end' };
}

const ARROW = 6;

export function edgeGeom(e: GEdge, byId: Map<string, GNode>): EdgeGeom {
  const a = byId.get(e.from);
  const b = byId.get(e.to);
  if (!a || !b) throw new Error(`graph edge ${e.from} -> ${e.to}: unknown node`);
  const [fs, ts] = sidesFor(a, b);
  const p0 = anchorOf(a, e.fromSide ?? fs, e.fromOff);
  const p3 = anchorOf(b, e.toSide ?? ts, e.toOff);
  const back = e.bare ? 0 : ARROW;
  const end = { x: p3.x + p3.nx * back, y: p3.y + p3.ny * back };
  const dist = Math.hypot(end.x - p0.x, end.y - p0.y);
  const k = Math.max(10, Math.min(54, dist * 0.45));
  const c1 = { x: p0.x + p0.nx * k, y: p0.y + p0.ny * k };
  const c2 = { x: end.x + p3.nx * k, y: end.y + p3.ny * k };
  const f = (v: number) => Math.round(v * 10) / 10;
  const d =
    e.route === 'spine'
      ? `M${f(p0.x)},${f(p0.y)} V${f(end.y - 8)} Q${f(p0.x)},${f(end.y)} ${f(p0.x + 8)},${f(end.y)} H${f(end.x)}`
      : `M${f(p0.x)},${f(p0.y)} C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(end.x)},${f(end.y)}`;
  let head: string | undefined;
  if (!e.bare) {
    // Tip on the node, pointing into it; base a few px out along the side's normal.
    const px = -p3.ny;
    const py = p3.nx;
    const bx = p3.x + p3.nx * ARROW;
    const by = p3.y + p3.ny * ARROW;
    head = `M${f(p3.x)},${f(p3.y)} L${f(bx + px * 3.2)},${f(by + py * 3.2)} L${f(bx - px * 3.2)},${f(by - py * 3.2)} Z`;
  }
  let label: EdgeGeom['label'];
  if (e.label) {
    const dx = e.labelDx ?? 0;
    const dy = e.labelDy ?? 0;
    if (e.labelAt === 'mid') {
      // The curve's middle (t = 0.5 of the cubic).
      const mx = 0.125 * p0.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * end.x;
      const my = 0.125 * p0.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * end.y;
      label = { x: mx + dx, y: my + 3.3 + dy, anchor: 'middle' };
    } else if (p3.nx !== 0) {
      // Beside a left or right side: on the line, just past the arrowhead.
      const gap = ARROW + 3;
      label = {
        x: p3.x + p3.nx * gap + dx,
        y: p3.y + 3.3 + dy,
        anchor: p3.nx > 0 ? 'start' : 'end',
      };
    } else {
      // Above or below: beside the line, clear of the arrowhead.
      label = {
        x: p3.x + 6 + dx,
        y: p3.y + p3.ny * (ARROW + 7) + 3.3 + dy,
        anchor: 'start',
      };
    }
  }
  return { d, head, label };
}
