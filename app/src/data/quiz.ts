import type { StatKey } from '../types';

export interface TermOption {
  id: string;
  label: string;
}

export interface TermQuestion {
  id: string;
  term: string;
  question: string;
  options: TermOption[];
  correctId: string;
  explanation: string;
}

export const TERM_QUESTIONS: TermQuestion[] = [
  {
    id: 'gantt',
    term: 'Gantt chart',
    question: "What does a Gantt chart show you?",
    options: [
      { id: 'a', label: 'A bar chart mapping tasks against a timeline, showing start/end dates and overlaps' },
      { id: 'b', label: "A financial statement of the project's spending" },
      { id: 'c', label: 'A survey of stakeholder satisfaction' },
      { id: 'd', label: 'A list of open bugs sorted by severity' },
    ],
    correctId: 'a',
    explanation: 'A Gantt chart lays tasks out against time so you can see what runs in parallel and what blocks what.',
  },
  {
    id: 'criticalPath',
    term: 'Critical path',
    question: "In project scheduling, the 'critical path' is...",
    options: [
      { id: 'a', label: 'The riskiest task on the project' },
      { id: 'b', label: 'The sequence of dependent tasks that determines the shortest possible project duration' },
      { id: 'c', label: 'The route stakeholders take to escalate complaints' },
      { id: 'd', label: 'The order tasks were added to the backlog' },
    ],
    correctId: 'b',
    explanation: "Any slip on the critical path slips the whole project — slack elsewhere doesn't save you.",
  },
  {
    id: 'kanban',
    term: 'Kanban board',
    question: 'What is a Kanban board for?',
    options: [
      { id: 'a', label: 'Tracking how much money each task costs' },
      { id: 'b', label: 'Ranking employees by performance' },
      { id: 'c', label: "Visualizing work as it flows through stages (e.g. To Do / In Progress / Done) and limiting how much is in progress at once" },
      { id: 'd', label: "Recording a product's long-term strategy" },
    ],
    correctId: 'c',
    explanation: 'Kanban makes work-in-progress visible so bottlenecks show up before they cause a pile-up.',
  },
  {
    id: 'riskRegister',
    term: 'Risk register',
    question: 'A risk register is best described as...',
    options: [
      { id: 'a', label: "A log of the risks a team is watching, with their probability, impact, and mitigation plan" },
      { id: 'b', label: "A record of closed support tickets" },
      { id: 'c', label: "A schedule of team vacations" },
      { id: 'd', label: "A list of every team member's salary" },
    ],
    correctId: 'a',
    explanation: 'Naming a risk before it happens is what lets you plan a response instead of scrambling.',
  },
  {
    id: 'stakeholder',
    term: 'Stakeholder',
    question: 'Who counts as a project stakeholder?',
    options: [
      { id: 'a', label: 'Only the person who pays for the project' },
      { id: 'b', label: 'A job title exclusive to executives' },
      { id: 'c', label: "A synonym for 'shareholder', used only in finance" },
      { id: 'd', label: "Anyone with an interest in the project's outcome, from sponsors to end users" },
    ],
    correctId: 'd',
    explanation: 'Sponsors, users, delivery teams, even regulators — if the outcome affects them, they have a stake.',
  },
  {
    id: 'scopeCreep',
    term: 'Scope creep',
    question: "'Scope creep' refers to...",
    options: [
      { id: 'a', label: "Planned, budgeted expansion of a project's requirements" },
      { id: 'b', label: "Uncontrolled growth in a project's requirements without matching adjustments to time, cost, or resources" },
      { id: 'c', label: 'The gradual improvement of code quality over time' },
      { id: 'd', label: 'A technique for prioritizing a backlog' },
    ],
    correctId: 'b',
    explanation: "'Just one more small thing' adds up — scope creep is what happens when nobody re-negotiates the plan to match.",
  },
];

export interface PersonalityOption {
  id: string;
  label: string;
  deltas: Partial<Record<StatKey, number>>;
}

export interface PersonalityQuestion {
  id: string;
  prompt: string;
  options: PersonalityOption[];
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: 'q-communication',
    prompt: "A stakeholder emails you confused and frustrated about a delay. What's your first move?",
    options: [
      { id: 'a', label: 'Call them right away and talk it through', deltas: { communication: 2 } },
      { id: 'b', label: 'Send a clear written update with the numbers behind the delay', deltas: { communication: 1, organization: 1 } },
      { id: 'c', label: 'Loop in the technical lead to explain the root cause', deltas: { technical: 1, communication: 1 } },
      { id: 'd', label: "Hold off until you have a fix, not just an explanation", deltas: { riskMgmt: 1, negotiation: 1 } },
    ],
  },
  {
    id: 'q-technical',
    prompt: 'A junior engineer is stuck on a gnarly bug two days before a demo. You...',
    options: [
      { id: 'a', label: 'Pair with them and dig into the code yourself', deltas: { technical: 2 } },
      { id: 'b', label: 'Reassign the task to someone stronger while they shadow', deltas: { organization: 1, leadership: 1 } },
      { id: 'c', label: 'Cut the demo scope down to buy time', deltas: { negotiation: 1, organization: 1 } },
      { id: 'd', label: 'Ask them to walk a group through their debugging process out loud', deltas: { communication: 1, technical: 1 } },
    ],
  },
  {
    id: 'q-negotiation',
    prompt: 'Finance wants to cut 15% from your budget mid-project. You...',
    options: [
      { id: 'a', label: 'Negotiate a scope trade — less budget for fewer features', deltas: { negotiation: 2 } },
      { id: 'b', label: 'Appeal directly to the sponsor with the delivery risk', deltas: { leadership: 1, negotiation: 1 } },
      { id: 'c', label: 'Absorb it by asking the team to work leaner', deltas: { organization: 1, riskMgmt: 1 } },
      { id: 'd', label: 'Push back with a detailed cost breakdown', deltas: { technical: 1, negotiation: 1 } },
    ],
  },
  {
    id: 'q-organization',
    prompt: 'Three workstreams are running at once and starting to overlap. You...',
    options: [
      { id: 'a', label: 'Build a shared board so everyone can see dependencies at a glance', deltas: { organization: 2 } },
      { id: 'b', label: 'Call a sync so everyone can talk it through directly', deltas: { communication: 1, organization: 1 } },
      { id: 'c', label: 'Assign one lead to own the sequencing', deltas: { leadership: 1, organization: 1 } },
      { id: 'd', label: 'Flag the ones most likely to collide as risks to watch', deltas: { riskMgmt: 1, organization: 1 } },
    ],
  },
  {
    id: 'q-risk',
    prompt: "A vendor integration you're depending on might slip. You...",
    options: [
      { id: 'a', label: "Build a fallback plan now, before it's urgent", deltas: { riskMgmt: 2 } },
      { id: 'b', label: "Escalate early so stakeholders aren't blindsided", deltas: { communication: 1, riskMgmt: 1 } },
      { id: "c", label: "Try to renegotiate the vendor's deadline", deltas: { negotiation: 1, riskMgmt: 1 } },
      { id: 'd', label: "Re-sequence the plan so it's off the critical path", deltas: { organization: 1, riskMgmt: 1 } },
    ],
  },
  {
    id: 'q-leadership',
    prompt: 'Morale is dipping after a rough sprint. You...',
    options: [
      { id: 'a', label: 'Have an honest one-on-one conversation with the team', deltas: { leadership: 2 } },
      { id: 'b', label: 'Publicly recognize what did go right', deltas: { communication: 1, leadership: 1 } },
      { id: 'c', label: "Remove a blocker that's been quietly grinding people down", deltas: { technical: 1, leadership: 1 } },
      { id: 'd', label: "Rebalance the workload so it's fairer", deltas: { organization: 1, leadership: 1 } },
    ],
  },
];

export const ROLE_LABEL: Record<StatKey, string> = {
  leadership: 'The Leader',
  technical: 'The Technician',
  communication: 'The Communicator',
  riskMgmt: 'The Risk Manager',
  negotiation: 'The Negotiator',
  organization: 'The Organizer',
};

export const ROLE_BLURB: Record<StatKey, string> = {
  leadership: 'You default to rallying people, not just tasks. Teams follow your lead when things get rough.',
  technical: 'You reach for the details first. You want to understand the problem before you manage it.',
  communication: 'You keep everyone in the loop before they have to ask. Silence makes you nervous.',
  riskMgmt: "You're already planning for what could go wrong, while everyone else is celebrating the plan.",
  negotiation: "You look for the trade before you look for the fight. Everything's negotiable to you.",
  organization: 'You want the system visible — boards, sequences, dependencies. Chaos bothers you more than most.',
};
