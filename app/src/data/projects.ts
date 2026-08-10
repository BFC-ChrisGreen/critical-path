export interface ProjectTemplate {
  id: string;
  name: string;
  brief: string;
  durationWeeks: number;
  budget: number;
  teamCap: number;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'meridian-pay',
    name: 'Meridian Pay',
    brief:
      'A mobile banking app for a regional credit union. Account overview, P2P transfers, and a payment-vendor integration for bill pay. The board wants it live in time for the spring product launch.',
    durationWeeks: 16,
    budget: 400000,
    teamCap: 4,
  },
  {
    id: 'wayfinder',
    name: 'Wayfinder',
    brief:
      'A route-optimization tool for a regional trucking company. Dispatchers need live re-routing around delays and a driver app that works with patchy signal. Fleet ops wants it running before peak season.',
    durationWeeks: 12,
    budget: 250000,
    teamCap: 3,
  },
  {
    id: 'harborlight',
    name: 'Harborlight',
    brief:
      "A patient intake portal for a hospital network. Compliance-heavy: identity verification, insurance capture, and an audit trail regulators will actually read. Legal signs off on nothing late.",
    durationWeeks: 20,
    budget: 550000,
    teamCap: 5,
  },
];
