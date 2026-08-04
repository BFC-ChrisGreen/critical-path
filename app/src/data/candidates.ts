import type { Candidate, TraitId } from '../types';

export const TRAIT_LABEL: Record<TraitId, string> = {
  mentor: 'Mentor',
  burnoutRisk: 'Burnout risk',
  maverick: 'Maverick',
  grinder: 'Grinder',
  primaDonna: 'Prima donna',
};

export const TRAIT_BLURB: Record<TraitId, string> = {
  mentor: 'Lifts the reliability of whoever they pair with.',
  burnoutRisk: 'Great output early, but morale crashes hard without relief.',
  maverick: 'Skips process. Fast, but sparks conflict with the team.',
  grinder: 'Steady and reliable. Never the star, never the problem.',
  primaDonna: 'Excellent work, poor patience for anyone slowing them down.',
};

export const CANDIDATE_POOL: Candidate[] = [
  {
    id: 'priya',
    name: 'Priya N.',
    role: 'Senior Backend Engineer',
    technical: 92,
    communication: 54,
    reliability: 88,
    costPerWeek: 2400,
    trait: 'mentor',
  },
  {
    id: 'jordan',
    name: 'Jordan K.',
    role: 'Full-Stack Developer',
    technical: 71,
    communication: 80,
    reliability: 45,
    costPerWeek: 1600,
    trait: 'burnoutRisk',
  },
  {
    id: 'sam',
    name: 'Sam O.',
    role: 'QA Engineer',
    technical: 65,
    communication: 60,
    reliability: 80,
    costPerWeek: 1200,
    trait: 'grinder',
  },
  {
    id: 'alex',
    name: 'Alex R.',
    role: 'Frontend Developer',
    technical: 75,
    communication: 70,
    reliability: 62,
    costPerWeek: 1500,
    trait: 'maverick',
  },
  {
    id: 'morgan',
    name: 'Morgan T.',
    role: 'DevOps Engineer',
    technical: 85,
    communication: 50,
    reliability: 75,
    costPerWeek: 2000,
    trait: 'primaDonna',
  },
  {
    id: 'casey',
    name: 'Casey L.',
    role: 'Junior Developer',
    technical: 50,
    communication: 65,
    reliability: 70,
    costPerWeek: 900,
    trait: 'grinder',
  },
];
