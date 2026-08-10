import type { Task } from '../types';

interface TaskBlueprint {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  weight: number;
}

const TASK_BLUEPRINT: TaskBlueprint[] = [
  {
    id: 'discovery',
    name: 'Requirements & discovery',
    description: 'Pin down what the stakeholders actually need before anyone builds anything.',
    dependencies: [],
    weight: 0.07,
  },
  {
    id: 'uxDesign',
    name: 'UX design',
    description: 'Wireframes and flows for every screen in scope.',
    dependencies: ['discovery'],
    weight: 0.11,
  },
  {
    id: 'architecture',
    name: 'Architecture & tech spec',
    description: 'Decide the shape of the system before the team starts writing code against it.',
    dependencies: ['discovery'],
    weight: 0.09,
  },
  {
    id: 'backend',
    name: 'Core backend build',
    description: 'The services and data model everything else depends on.',
    dependencies: ['architecture'],
    weight: 0.18,
  },
  {
    id: 'frontend',
    name: 'Core frontend build',
    description: 'The UI layer, built against the design and the backend contracts.',
    dependencies: ['uxDesign', 'architecture'],
    weight: 0.16,
  },
  {
    id: 'integration',
    name: 'Third-party integration',
    description: 'Wire up the external vendor or partner API the project depends on.',
    dependencies: ['backend'],
    weight: 0.09,
  },
  {
    id: 'qa',
    name: 'QA & testing',
    description: 'Exercise the whole system together and find what breaks.',
    dependencies: ['backend', 'frontend', 'integration'],
    weight: 0.11,
  },
  {
    id: 'compliance',
    name: 'Compliance & security review',
    description: 'Make sure nothing here gets flagged after launch instead of before it.',
    dependencies: ['backend', 'integration'],
    weight: 0.07,
  },
  {
    id: 'polish',
    name: 'Performance & polish',
    description: 'Close the gap between "works" and "ready to put your name on."',
    dependencies: ['qa'],
    weight: 0.06,
  },
  {
    id: 'launch',
    name: 'Launch & rollout',
    description: 'Ship it, and make sure it stays up once it is live.',
    dependencies: ['qa', 'compliance', 'polish'],
    weight: 0.06,
  },
];

export function buildTasks(durationWeeks: number): Task[] {
  return TASK_BLUEPRINT.map((bp): Task => {
    const estimateWeeks = Math.max(1, Math.round(bp.weight * durationWeeks * 2) / 2);
    return {
      id: bp.id,
      name: bp.name,
      description: bp.description,
      dependencies: [...bp.dependencies],
      estimateWeeks,
      remainingWeeks: estimateWeeks,
      status: 'todo',
      assignedTo: null,
    };
  });
}
