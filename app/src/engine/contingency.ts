import type { ContingencyStance, ResolveOutcome } from '../types';

export const CONTINGENCY_LABEL: Record<ContingencyStance, string> = {
  absorb: 'Absorb',
  escalate: 'Escalate',
  delegate: 'Delegate',
};

export const CONTINGENCY_BLURB: Record<ContingencyStance, string> = {
  absorb: 'If this fires, the team eats the schedule and morale hit more gracefully. Softens both, costs nothing extra.',
  escalate: 'If this fires, you throw budget at it fast. Softens the schedule hit hard, but it costs money.',
  delegate: 'If this fires, the load gets spread across the team instead of one person carrying it. Softens the morale hit.',
};

export function applyContingency(outcome: ResolveOutcome, stance: ContingencyStance | null, budget: number): ResolveOutcome {
  if (!stance) return outcome;
  const next = { ...outcome };

  if (stance === 'absorb') {
    if (next.percentDelta && next.percentDelta < 0) next.percentDelta *= 0.65;
    if (next.moraleDelta && next.moraleDelta < 0) next.moraleDelta *= 0.65;
  } else if (stance === 'escalate') {
    if (next.percentDelta && next.percentDelta < 0) {
      const softened = next.percentDelta * 0.4;
      const recovered = next.percentDelta - softened;
      next.percentDelta = softened;
      next.acDelta = (next.acDelta ?? 0) + (Math.abs(recovered) / 100) * budget * 0.15;
    }
  } else if (stance === 'delegate') {
    if (next.moraleDelta && next.moraleDelta < 0) next.moraleDelta *= 0.4;
  }

  return next;
}
