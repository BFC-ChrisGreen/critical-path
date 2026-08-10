import { create } from 'zustand';
import type {
  Background,
  ContingencyStance,
  GameState,
  HistoryPoint,
  LogEntry,
  Milestone,
  MilestoneId,
  Screen,
  Stakeholder,
  StakeholderId,
  Stats,
  Task,
} from './types';
import { CANDIDATE_POOL } from './data/candidates';
import { INITIAL_RISKS } from './data/risks';
import { INITIAL_STAKEHOLDERS } from './data/stakeholders';
import { EVENTS, FLOATING_EVENTS, RISK_EVENT_MAP } from './data/events';
import { PROJECT_TEMPLATES } from './data/projects';
import { buildTasks } from './data/tasks';
import { avgTechnical, cpi, spi, weeklyPayroll, clamp, earnedValue } from './engine/evm';
import { advanceTasks, isUnlocked, taskProgressPercent } from './engine/tasks';
import { applyContingency } from './engine/contingency';

const SAVE_KEY = 'critical-path-save-v1';

const MILESTONE_LABEL: Record<MilestoneId, string> = {
  design: 'Product design & capabilities',
  identity: 'Product identity',
  production: 'Production status',
  distribution: 'Distribution',
};

function defaultMilestones(durationWeeks: number): Milestone[] {
  return [
    { id: 'design', label: MILESTONE_LABEL.design, targetWeek: Math.max(1, Math.ceil(durationWeeks * 0.25)) },
    { id: 'identity', label: MILESTONE_LABEL.identity, targetWeek: Math.max(1, Math.ceil(durationWeeks * 0.5)) },
    { id: 'production', label: MILESTONE_LABEL.production, targetWeek: Math.max(1, Math.ceil(durationWeeks * 0.75)) },
    { id: 'distribution', label: MILESTONE_LABEL.distribution, targetWeek: durationWeeks },
  ];
}

function freshProject() {
  const template = PROJECT_TEMPLATES[0];
  return { ...template, week: 0, ac: 0, percentComplete: 0, scopeAdjustment: 0 };
}

function initialState(): GameState {
  return {
    screen: 'intro',
    personalityAllocation: null,
    character: null,
    projectId: null,
    project: freshProject(),
    milestones: [],
    tasks: [],
    team: [],
    candidatePool: CANDIDATE_POOL.map((c) => ({ ...c })),
    riskRegister: INITIAL_RISKS.map((r) => ({ ...r })),
    stakeholders: INITIAL_STAKEHOLDERS.map((s) => ({ ...s })),
    morale: 70,
    eventLog: [],
    pendingEvent: null,
    gameOver: null,
    history: [],
  };
}

interface Store extends GameState {
  completeIntro: () => void;
  completePersonality: (allocation: Stats) => void;
  createCharacter: (name: string, background: Background, stats: Stats) => void;
  chooseProject: (id: string) => void;
  setMilestoneWeek: (id: MilestoneId, week: number) => void;
  assignTask: (taskId: string, candidateId: string) => void;
  unassignTask: (taskId: string) => void;
  toggleMitigate: (riskId: string) => void;
  setContingency: (riskId: string, stance: ContingencyStance | null) => void;
  hireCandidate: (id: string) => void;
  releaseCandidate: (id: string) => void;
  startProject: () => void;
  advanceWeek: () => void;
  resolveEvent: (choiceId: string) => void;
  resetGame: () => void;
  persist: () => void;
}

function weightedPick(): (typeof FLOATING_EVENTS)[number] | null {
  if (Math.random() > 0.32) return null;
  const totalWeight = FLOATING_EVENTS.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const ev of FLOATING_EVENTS) {
    roll -= ev.weight;
    if (roll <= 0) return ev;
  }
  return FLOATING_EVENTS[0];
}

function reviewStakeholders(
  stakeholders: Stakeholder[],
  perf: { c: number; s: number },
  communication: number,
): { stakeholders: Stakeholder[]; log: string } {
  const dampener = 1 - communication / 220;
  const next = stakeholders.map((st) => {
    let delta = 0;
    if (st.id === 'sponsor') delta = (perf.c - 1) * 40;
    if (st.id === 'productOwner') delta = (perf.s - 1) * 40;
    if (st.id === 'endUser') delta = (perf.c + perf.s - 2) * 20;
    if (delta < 0) delta *= dampener;
    return { ...st, trust: clamp(Math.round(st.trust + delta), 0, 100) };
  });
  return {
    stakeholders: next,
    log: `Cost index ${perf.c.toFixed(2)}, schedule index ${perf.s.toFixed(2)}.`,
  };
}

function finishWeekTail(
  project: GameState['project'],
  morale: number,
  stakeholders: Stakeholder[],
  riskRegister: GameState['riskRegister'],
  tasks: Task[],
  eventLog: LogEntry[],
  history: HistoryPoint[],
): Partial<GameState> {
  let nextStakeholders = stakeholders;
  const nextLog = [...eventLog];
  const nextHistory = [...history, { week: project.week, ac: project.ac, percentComplete: project.percentComplete }];

  if (project.week > 0 && project.week % 4 === 0) {
    const perf = { c: cpi(project), s: spi(project) };
    const result = reviewStakeholders(stakeholders, perf, 50);
    nextStakeholders = result.stakeholders;
    nextLog.push({ week: project.week, title: 'Stakeholder review', message: result.log, kind: 'review' });
  }

  let screen: Screen = 'weekbeat';
  let gameOver: GameState['gameOver'] = null;

  const collapsed = nextStakeholders.find((s) => s.trust <= 0);
  if (collapsed) {
    gameOver = 'cancelled';
    screen = 'debrief';
    nextLog.push({
      week: project.week,
      title: 'Project cancelled',
      message: `${collapsed.name} pulled support. The project is shut down.`,
      kind: 'system',
    });
  } else if (project.ac > project.budget * 1.2) {
    gameOver = 'bankrupt';
    screen = 'debrief';
    nextLog.push({ week: project.week, title: 'Budget exhausted', message: 'Actual cost has blown past what the org will cover.', kind: 'system' });
  } else if (project.week >= project.durationWeeks) {
    gameOver = 'delivered';
    screen = 'debrief';
    nextLog.push({ week: project.week, title: 'Project delivered', message: 'The timeline has run its course. Final numbers are in.', kind: 'system' });
  }

  return {
    project,
    morale,
    stakeholders: nextStakeholders,
    riskRegister,
    tasks,
    eventLog: nextLog,
    screen,
    gameOver,
    pendingEvent: null,
    history: nextHistory,
  };
}

export const useGameStore = create<Store>((set, get) => ({
  ...initialState(),

  completeIntro: () => {
    set({ screen: 'personality' });
    get().persist();
  },

  completePersonality: (allocation) => {
    set({ screen: 'create', personalityAllocation: allocation });
    get().persist();
  },

  createCharacter: (name, background, stats) => {
    set({ character: { name, background, stats }, screen: 'kickoff' });
    get().persist();
  },

  chooseProject: (id) => {
    const template = PROJECT_TEMPLATES.find((t) => t.id === id);
    if (!template) return;
    set({
      projectId: id,
      project: { ...template, week: 0, ac: 0, percentComplete: 0, scopeAdjustment: 0 },
      milestones: defaultMilestones(template.durationWeeks),
      tasks: buildTasks(template.durationWeeks),
    });
  },

  setMilestoneWeek: (id, week) => {
    set((state) => ({
      milestones: state.milestones.map((m) =>
        m.id === id ? { ...m, targetWeek: clamp(week, 1, state.project.durationWeeks) } : m,
      ),
    }));
  },

  assignTask: (taskId, candidateId) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task || task.status !== 'todo' || !isUnlocked(task, state.tasks)) return state;
      const isFree = state.team.some((c) => c.id === candidateId) &&
        !state.tasks.some((t) => t.assignedTo === candidateId);
      if (!isFree) return state;
      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'inProgress', assignedTo: candidateId } : t,
        ),
      };
    });
  },

  unassignTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId && t.status === 'inProgress' ? { ...t, status: 'todo', assignedTo: null } : t,
      ),
    }));
  },

  toggleMitigate: (riskId) => {
    set((state) => {
      const riskRegister = state.riskRegister.map((r) => {
        if (r.id !== riskId) return r;
        return { ...r, mitigated: !r.mitigated };
      });
      const risk = riskRegister.find((r) => r.id === riskId)!;
      const original = state.riskRegister.find((r) => r.id === riskId)!;
      const acDelta = risk.mitigated && !original.mitigated ? risk.mitigationCost : !risk.mitigated && original.mitigated ? -risk.mitigationCost : 0;
      return {
        riskRegister,
        project: { ...state.project, ac: Math.max(0, state.project.ac + acDelta) },
      };
    });
  },

  setContingency: (riskId, stance) => {
    set((state) => ({
      riskRegister: state.riskRegister.map((r) => (r.id === riskId ? { ...r, contingency: stance } : r)),
    }));
  },

  hireCandidate: (id) => {
    set((state) => {
      if (state.team.length >= state.project.teamCap) return state;
      const candidate = state.candidatePool.find((c) => c.id === id);
      if (!candidate) return state;
      return {
        team: [...state.team, candidate],
        candidatePool: state.candidatePool.filter((c) => c.id !== id),
      };
    });
  },

  releaseCandidate: (id) => {
    set((state) => {
      const candidate = state.team.find((c) => c.id === id);
      if (!candidate) return state;
      return {
        candidatePool: [...state.candidatePool, candidate],
        team: state.team.filter((c) => c.id !== id),
      };
    });
  },

  startProject: () => {
    set({ screen: 'weekbeat' });
    get().persist();
  },

  advanceWeek: () => {
    const state = get();
    if (state.pendingEvent || state.gameOver) return;
    if (state.project.week >= state.project.durationWeeks) return;

    const project = { ...state.project, week: state.project.week + 1 };
    project.ac += weeklyPayroll(state.team);

    const tasks = advanceTasks(state.tasks, state.team, state.morale);
    project.percentComplete = clamp(taskProgressPercent(tasks) + project.scopeAdjustment, 0, 100);

    let morale = clamp(state.morale + (state.character!.stats.leadership - 50) / 40, 0, 100);

    const riskRegister = state.riskRegister.map((r) => ({ ...r }));
    let triggeredEventId: string | null = null;

    for (const risk of riskRegister) {
      if (risk.triggered) continue;
      let weeklyChance = 1 - Math.pow(1 - risk.probability, 1 / project.durationWeeks);
      if (risk.mitigated) weeklyChance *= 0.2;
      if (risk.id === 'burnout' && state.team.some((m) => m.trait === 'burnoutRisk')) weeklyChance *= 1.6;
      if (Math.random() < weeklyChance) {
        risk.triggered = true;
        triggeredEventId = RISK_EVENT_MAP[risk.id];
        break;
      }
    }

    if (!triggeredEventId) {
      const floating = weightedPick();
      if (floating) triggeredEventId = floating.id;
    }

    if (triggeredEventId) {
      set({
        project,
        morale,
        riskRegister,
        tasks,
        pendingEvent: { eventId: triggeredEventId },
      });
      get().persist();
      return;
    }

    set(finishWeekTail(project, morale, state.stakeholders, riskRegister, tasks, state.eventLog, state.history));
    get().persist();
  },

  resolveEvent: (choiceId) => {
    const state = get();
    if (!state.pendingEvent) return;
    const event = EVENTS.find((e) => e.id === state.pendingEvent!.eventId);
    if (!event) return;
    const choice = event.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    let outcome = choice.resolve({ stats: state.character!.stats, team: state.team, project: state.project });

    if (event.riskId) {
      const risk = state.riskRegister.find((r) => r.id === event.riskId);
      if (risk?.contingency) {
        outcome = applyContingency(outcome, risk.contingency, state.project.budget);
      }
    }

    const project = { ...state.project };
    project.ac = Math.max(0, project.ac + (outcome.acDelta ?? 0));
    project.scopeAdjustment += outcome.percentDelta ?? 0;
    project.percentComplete = clamp(taskProgressPercent(state.tasks) + project.scopeAdjustment, 0, 100);

    const morale = clamp(state.morale + (outcome.moraleDelta ?? 0), 0, 100);

    const stakeholders = state.stakeholders.map((s) => {
      const delta = outcome.trustDeltas?.[s.id as StakeholderId];
      return delta ? { ...s, trust: clamp(s.trust + delta, 0, 100) } : s;
    });

    const eventLog: LogEntry[] = [
      ...state.eventLog,
      { week: project.week, title: event.title, message: outcome.message, kind: 'event' },
    ];

    set(finishWeekTail(project, morale, stakeholders, state.riskRegister, state.tasks, eventLog, state.history));
    get().persist();
  },

  resetGame: () => {
    localStorage.removeItem(SAVE_KEY);
    set(initialState());
  },

  persist: () => {
    const { screen, personalityAllocation, character, projectId, project, milestones, tasks, team, candidatePool, riskRegister, stakeholders, morale, eventLog, pendingEvent, gameOver, history } = get();
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ screen, personalityAllocation, character, projectId, project, milestones, tasks, team, candidatePool, riskRegister, stakeholders, morale, eventLog, pendingEvent, gameOver, history }),
      );
    } catch {
      // storage unavailable, skip silently
    }
  },
}));

export function loadSavedGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as GameState;
    useGameStore.setState(saved);
    return true;
  } catch {
    return false;
  }
}

export { avgTechnical, earnedValue };
