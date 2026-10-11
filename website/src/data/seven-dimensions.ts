// The seven dimensions of decision quality (hivemind docs/DECISION_SCORING.md, master) and our own
// project's REAL profiles, for the slide-4 concepts in pitch/variants/ (DRAFT, not on the live deck).
// Source: a copy of the city file ledger, decisions recorded before 2026-10-07 07:54 UTC (the same cut
// as the 11/40 count on site PR #26), `hivemind query verify` for who decided (decider_ids: human: or
// agent:) and `hivemind query score_decision` (floor_version 2, no model) for each level. Levels say what
// the record shows, never that a decision was sound: none = nothing on record toward it; na = not assessed.
export type Level = 'solid' | 'partial' | 'none' | 'na';
export type Who = 'you' | 'agent';
export const dimensions = [
  { id: 'framing', name: "Framing", question: "Was the right problem framed?" },
  { id: 'alternatives', name: "Alternatives", question: "Were real options weighed?" },
  { id: 'information', name: "Information", question: "Was the relevant information gathered and used?" },
  { id: 'reasoning', name: "Reasoning", question: "Does the choice follow from the information?" },
  { id: 'values_tradeoffs', name: "Values / Tradeoffs", question: "Were the tradeoffs made explicit and weighed?" },
  { id: 'bias_exposure', name: "Bias exposure", question: "Anchoring, confirmation, sunk cost, motivated reasoning?" },
  { id: 'calibration', name: "Calibration", question: "Did confidence match the evidence?" },
] as const;
export const counted = { at: '2026-10-07 07:54 UTC', you: 11, agent: 40 };
/** Per dimension, per who decided: how many decisions sit at each level. */
export const profileCounts: Record<string, Record<Who, Partial<Record<Level, number>>>> = {
  framing: { you: {"none": 8, "partial": 3}, agent: {"none": 38, "partial": 2} },
  alternatives: { you: {"partial": 9, "solid": 2}, agent: {"solid": 33, "partial": 7} },
  information: { you: {"partial": 8, "solid": 3}, agent: {"none": 3, "solid": 35, "partial": 2} },
  reasoning: { you: {"partial": 11}, agent: {"partial": 40} },
  values_tradeoffs: { you: {"na": 11}, agent: {"na": 40} },
  bias_exposure: { you: {"partial": 11}, agent: {"partial": 40} },
  calibration: { you: {"na": 11}, agent: {"na": 40} },
};
/** Every decision, oldest first within who decided: its seven levels in the order of `dimensions`. */
export const decisions: { who: Who; levels: Level[] }[] = [
  { who: 'you', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "solid", "partial", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["partial", "partial", "solid", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["partial", "partial", "solid", "partial", "na", "partial", "na"] },
  { who: 'you', levels: ["partial", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "none", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "none", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "partial", "none", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "partial", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "partial", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["partial", "partial", "partial", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["partial", "partial", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "solid", "solid", "partial", "na", "partial", "na"] },
  { who: 'agent', levels: ["none", "partial", "solid", "partial", "na", "partial", "na"] },
];
/** The most common profile of each group (how many decisions share it). */
export const typical: Record<Who, { levels: Level[]; share: number }> = {
  you: { levels: ["none", "partial", "partial", "partial", "na", "partial", "na"], share: 6 },
  agent: { levels: ["none", "solid", "solid", "partial", "na", "partial", "na"], share: 31 },
};
