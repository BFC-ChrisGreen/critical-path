import type { Candidate, Milestone, ProjectState, Risk, Stakeholder } from '../types';
import { avgTechnical, cpi, spi } from './evm';

export interface SwotResult {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SwotInput {
  team: Candidate[];
  morale: number;
  project: ProjectState;
  riskRegister: Risk[];
  stakeholders: Stakeholder[];
  milestones: Milestone[];
}

function cap(list: string[], fallback: string): string[] {
  if (list.length === 0) return [fallback];
  return list.slice(0, 4);
}

export function deriveSwot({ team, morale, project, riskRegister, stakeholders, milestones }: SwotInput): SwotResult {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  const tech = avgTechnical(team);
  if (tech >= 70) strengths.push(`Strong technical bench (avg ${Math.round(tech)})`);
  else if (team.length > 0 && tech < 55) weaknesses.push(`Thin technical depth (avg ${Math.round(tech)})`);

  if (morale >= 70) strengths.push('Team morale is high');
  else if (morale < 40) weaknesses.push('Team morale is low');

  if (project.week > 0) {
    const c = cpi(project);
    const s = spi(project);
    if (c >= 1.05) strengths.push('Running efficient relative to value delivered');
    else if (c < 0.9) weaknesses.push('Cost is outpacing earned value');
    if (s >= 1.05) strengths.push('Ahead of the planned schedule');
    else if (s < 0.9) weaknesses.push('Behind the planned schedule');
  }

  if (team.length < project.teamCap) {
    opportunities.push(`Room to hire ${project.teamCap - team.length} more before the cap`);
  }

  const highTrust = stakeholders.filter((s) => s.trust >= 75);
  if (highTrust.length > 0) {
    opportunities.push(`${highTrust.map((s) => s.name).join(', ')} trust${highTrust.length === 1 ? 's' : ''} you enough to ask for slack`);
  }

  const upcoming = milestones
    .filter((m) => m.targetWeek >= project.week && m.targetWeek - project.week <= 2)
    .sort((a, b) => a.targetWeek - b.targetWeek)[0];
  if (upcoming) {
    opportunities.push(`${upcoming.label} lands in ${Math.max(0, upcoming.targetWeek - project.week)}w — a chance to show momentum`);
  }

  for (const risk of riskRegister) {
    if (risk.triggered) continue;
    if (!risk.mitigated && risk.impact === 'high') threats.push(`${risk.name} is unmitigated and high-impact`);
    if (!risk.mitigated && !risk.contingency) threats.push(`No contingency plan set for ${risk.name}`);
  }

  const lowTrust = stakeholders.filter((s) => s.trust < 30);
  if (lowTrust.length > 0) {
    threats.push(`${lowTrust.map((s) => s.name).join(', ')} trust${lowTrust.length === 1 ? ' is' : ' are'} critically low`);
  }

  return {
    strengths: cap(strengths, 'Nothing standout yet'),
    weaknesses: cap(weaknesses, 'No clear weak spots right now'),
    opportunities: cap(opportunities, 'No obvious openings this week'),
    threats: cap(threats, 'No immediate threats on the board'),
  };
}
