import type { Task } from '../types';

export interface TaskSchedule {
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
}

export function computeSchedule(tasks: Task[]): Record<string, TaskSchedule> {
  const byId = new Map(tasks.map((t) => [t.id, t]));

  const successors = new Map<string, string[]>();
  for (const task of tasks) {
    for (const depId of task.dependencies) {
      const list = successors.get(depId) ?? [];
      list.push(task.id);
      successors.set(depId, list);
    }
  }

  const earlyFinishCache = new Map<string, number>();
  function earlyFinish(id: string): number {
    const cached = earlyFinishCache.get(id);
    if (cached !== undefined) return cached;
    const task = byId.get(id);
    if (!task) return 0;
    const earlyStart = task.dependencies.reduce((max, depId) => Math.max(max, earlyFinish(depId)), 0);
    const result = earlyStart + task.estimateWeeks;
    earlyFinishCache.set(id, result);
    return result;
  }

  for (const task of tasks) earlyFinish(task.id);
  const projectDuration = Math.max(0, ...tasks.map((t) => earlyFinish(t.id)));

  const lateStartCache = new Map<string, number>();
  function lateStart(id: string): number {
    const cached = lateStartCache.get(id);
    if (cached !== undefined) return cached;
    const task = byId.get(id);
    if (!task) return 0;
    const succ = successors.get(id) ?? [];
    const lateFinish = succ.length === 0 ? projectDuration : Math.min(...succ.map((sid) => lateStart(sid)));
    const result = lateFinish - task.estimateWeeks;
    lateStartCache.set(id, result);
    return result;
  }

  for (const task of tasks) lateStart(task.id);

  const schedule: Record<string, TaskSchedule> = {};
  for (const task of tasks) {
    const taskEarlyFinish = earlyFinish(task.id);
    const earlyStart = taskEarlyFinish - task.estimateWeeks;
    const taskLateStart = lateStart(task.id);
    const lateFinish = taskLateStart + task.estimateWeeks;
    const slack = taskLateStart - earlyStart;
    schedule[task.id] = {
      earlyStart,
      earlyFinish: taskEarlyFinish,
      lateStart: taskLateStart,
      lateFinish,
      slack,
      isCritical: slack <= 0,
    };
  }
  return schedule;
}

export function criticalPathWeeks(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const schedule = computeSchedule(tasks);
  return Math.max(0, ...Object.values(schedule).map((s) => s.earlyFinish));
}
