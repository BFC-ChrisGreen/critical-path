import type { Background, Stats } from '../types';

export const BACKGROUND_LABEL: Record<Background, string> = {
  engineer: 'Engineer → PM',
  analyst: 'Business Analyst → PM',
  scrumMaster: 'Scrum Master → PM',
};

export const BACKGROUND_BLURB: Record<Background, string> = {
  engineer: 'You shipped code for years before moving into planning. You read a codebase faster than a Gantt chart.',
  analyst: 'You spent your career translating between clients and delivery teams. You know how to get a straight answer out of anyone.',
  scrumMaster: 'You ran ceremonies for three different teams before this. You keep a room honest and a backlog moving.',
};

export const BACKGROUND_BASE_STATS: Record<Background, Stats> = {
  engineer: {
    leadership: 40,
    technical: 70,
    communication: 40,
    riskMgmt: 60,
    negotiation: 30,
    organization: 50,
  },
  analyst: {
    leadership: 45,
    technical: 35,
    communication: 70,
    riskMgmt: 45,
    negotiation: 65,
    organization: 50,
  },
  scrumMaster: {
    leadership: 65,
    technical: 40,
    communication: 55,
    riskMgmt: 35,
    negotiation: 45,
    organization: 70,
  },
};

export const ALLOCATABLE_POINTS = 12;
