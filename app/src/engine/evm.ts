import type { Candidate, ProjectState, Stats } from '../types';

export function weeklyPayroll(team: Candidate[]): number {
  return team.reduce((sum, m) => sum + m.costPerWeek, 0);
}

export function avgTechnical(team: Candidate[]): number {
  if (team.length === 0) return 40;
  return team.reduce((sum, m) => sum + m.technical, 0) / team.length;
}

export function plannedValue(project: ProjectState): number {
  return (Math.min(project.week, project.durationWeeks) / project.durationWeeks) * project.budget;
}

export function earnedValue(project: ProjectState): number {
  return (project.percentComplete / 100) * project.budget;
}

export function cpi(project: ProjectState): number {
  return project.ac > 0 ? earnedValue(project) / project.ac : 1;
}

export function spi(project: ProjectState): number {
  const pv = plannedValue(project);
  return pv > 0 ? earnedValue(project) / pv : 1;
}

export function productivityFactor(team: Candidate[], stats: Stats, morale: number): number {
  const tech = avgTechnical(team);
  const base =
    0.85 +
    (tech - 50) / 200 +
    (stats.organization - 50) / 300 +
    (morale - 50) / 400 +
    (Math.random() - 0.5) * 0.12;
  return Math.max(0.4, Math.min(1.35, base));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export type Grade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export function scoreToGrade(score: number): Grade {
  if (score >= 97) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 85) return 'B+';
  if (score >= 78) return 'B';
  if (score >= 72) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 58) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  return 'F';
}

export function gradeTone(grade: Grade): 'good' | 'warn' | 'risk' {
  if (grade === 'A' || grade === 'A-' || grade === 'B+') return 'good';
  if (grade === 'B' || grade === 'B-' || grade === 'C+') return 'warn';
  return 'risk';
}
