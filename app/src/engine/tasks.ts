import type { Candidate, Task } from '../types';

export function isUnlocked(task: Task, tasks: Task[]): boolean {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  return task.dependencies.every((depId) => byId.get(depId)?.status === 'done');
}

export function advanceTasks(tasks: Task[], team: Candidate[], morale: number): Task[] {
  const teamById = new Map(team.map((c) => [c.id, c]));
  const moraleMultiplier = 0.7 + morale / 200;

  return tasks.map((task): Task => {
    if (task.status !== 'inProgress' || !task.assignedTo) return task;
    const member = teamById.get(task.assignedTo);
    if (!member) return task;

    const rate = (0.4 + member.technical / 150) * (0.7 + member.reliability / 280) * moraleMultiplier;
    const remainingWeeks = Math.max(0, task.remainingWeeks - rate);

    if (remainingWeeks <= 0) {
      return { ...task, remainingWeeks: 0, status: 'done', assignedTo: null };
    }
    return { ...task, remainingWeeks };
  });
}

export function taskProgressPercent(tasks: Task[]): number {
  const total = tasks.reduce((sum, t) => sum + t.estimateWeeks, 0);
  if (total <= 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').reduce((sum, t) => sum + t.estimateWeeks, 0);
  return (done / total) * 100;
}
