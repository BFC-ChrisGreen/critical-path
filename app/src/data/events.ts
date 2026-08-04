import type { GameEvent, ResolveCtx } from '../types';

function avgTechnical(ctx: ResolveCtx): number {
  if (ctx.team.length === 0) return 50;
  return ctx.team.reduce((sum, m) => sum + m.technical, 0) / ctx.team.length;
}

function roll(chance: number): boolean {
  return Math.random() < chance;
}

export const EVENTS: GameEvent[] = [
  {
    id: 'devQuit',
    title: 'A developer hands in their notice',
    description: 'One of your team pulls you aside after standup: they have accepted an offer elsewhere and are giving two weeks.',
    weight: 3,
    choices: [
      {
        id: 'counter',
        label: 'Make a counter-offer',
        description: 'Spend budget to keep them. Works better if they trust you.',
        resolve: (ctx) => {
          const success = roll(0.4 + ctx.stats.leadership / 250);
          if (success) {
            return { message: 'They agree to stay. It cost you, but the team keeps its capacity.', acDelta: 6000 };
          }
          return { message: 'The counter-offer was not enough. They leave anyway, and morale dips from the back-and-forth.', acDelta: 3000, moraleDelta: -6 };
        },
      },
      {
        id: 'letgo',
        label: 'Let them go gracefully',
        description: 'No cost, but the team is down a pair of hands for the rest of the project.',
        resolve: () => ({
          message: 'They leave on good terms. The team absorbs the gap, and progress slows this sprint.',
          percentDelta: -4,
        }),
      },
      {
        id: 'redistribute',
        label: 'Redistribute the workload immediately',
        description: 'Push the remaining team to cover the gap starting now.',
        resolve: () => ({
          message: 'The team covers the load, but the extra pressure costs morale.',
          moraleDelta: -10,
        }),
      },
    ],
  },
  {
    id: 'scopeCreep',
    title: 'The client wants one more thing',
    description: 'A stakeholder emails asking for a feature that was never in the brief, framed as "small."',
    weight: 4,
    choices: [
      {
        id: 'accept',
        label: 'Accept it into scope',
        description: 'Keep the relationship smooth. The extra work dilutes how much of the total you have finished.',
        resolve: () => ({
          message: 'You take it on. The total scope grows, which quietly eats into your completion percentage.',
          percentDelta: -8,
          trustDeltas: { productOwner: 4 },
        }),
      },
      {
        id: 'negotiate',
        label: 'Negotiate a smaller version',
        description: 'Your Negotiation stat decides how much you can trim.',
        resolve: (ctx) => {
          const success = roll(0.3 + ctx.stats.negotiation / 150);
          if (success) {
            return { message: 'You talk it down to something manageable. Minimal damage.', percentDelta: -3, trustDeltas: { productOwner: 2 } };
          }
          return { message: 'They push back and you take the full version anyway.', percentDelta: -8 };
        },
      },
      {
        id: 'reject',
        label: 'Reject it outright',
        description: 'Protect the timeline. The Product Owner will not love hearing no.',
        resolve: () => ({
          message: 'You hold the line on scope. The Product Owner is frustrated but the plan stays intact.',
          trustDeltas: { productOwner: -10 },
        }),
      },
    ],
  },
  {
    id: 'vendorDelay',
    title: 'The payment vendor slips their date',
    description: 'The third-party integration you were counting on is now three weeks late, with no firm new date.',
    weight: 0,
    riskId: 'vendorDelay',
    choices: [
      {
        id: 'wait',
        label: 'Wait it out',
        description: 'No cost, but the schedule absorbs the full delay.',
        resolve: () => ({ message: 'You wait on the vendor. The schedule slips.', percentDelta: -10 }),
      },
      {
        id: 'expedite',
        label: 'Pay an expedite fee',
        description: 'Buy your place back in their queue.',
        resolve: () => ({ message: 'The fee gets you back on schedule.', acDelta: 12000 }),
      },
      {
        id: 'workaround',
        label: 'Build an in-house workaround',
        description: 'Uses your team\'s technical strength this sprint instead of cash.',
        resolve: (ctx) => {
          const strong = avgTechnical(ctx) >= 70;
          if (strong) return { message: 'Your team engineers a workaround fast enough that the delay barely registers.', moraleDelta: -4 };
          return { message: 'The workaround takes longer than hoped; it costs time and patience.', percentDelta: -5, moraleDelta: -8 };
        },
      },
    ],
  },
  {
    id: 'prodBug',
    title: 'A bug ships to production',
    description: 'Support tickets start piling up. Something got past testing.',
    weight: 3,
    choices: [
      {
        id: 'hotfix',
        label: 'Hotfix it now',
        description: 'Pull the team off sprint work to fix it immediately.',
        resolve: () => ({ message: 'The team drops everything and patches it same-day. Sprint progress stalls.', percentDelta: -5 }),
      },
      {
        id: 'nextSprint',
        label: 'Queue it for next sprint',
        description: 'Keep momentum, but users notice the wait.',
        resolve: () => ({ message: 'You keep the sprint on track. The end-user rep is not thrilled about the wait.', trustDeltas: { endUser: -10 } }),
      },
      {
        id: 'firedrill',
        label: 'Run an all-hands fire drill',
        description: 'Fast fix, hard on the team.',
        resolve: () => ({ message: 'It gets fixed within hours. The team is drained by the sudden scramble.', moraleDelta: -10 }),
      },
    ],
  },
  {
    id: 'teamConflict',
    title: 'Tension boils over in the team',
    description: 'Two team members clash openly over how a task should be done.',
    weight: 3,
    choices: [
      {
        id: 'mediate',
        label: 'Mediate it yourself',
        description: 'Your Leadership stat decides how well this lands.',
        resolve: (ctx) => {
          const success = roll(0.35 + ctx.stats.leadership / 150);
          if (success) return { message: 'You get both sides talking again. The team is steadier for it.', moraleDelta: 6 };
          return { message: 'The conversation goes sideways and the tension lingers.', moraleDelta: -8 };
        },
      },
      {
        id: 'ignore',
        label: 'Let it blow over',
        description: 'No time spent, but nothing is resolved either.',
        resolve: () => ({ message: 'You leave it alone. It cools down, but trust between them stays thin.', moraleDelta: -5 }),
      },
      {
        id: 'formal',
        label: 'Escalate to a formal process',
        description: 'Slower, but it settles the matter properly.',
        resolve: () => ({ message: 'A formal process resolves it cleanly, though it takes a few uncomfortable days.', percentDelta: -3, moraleDelta: 3 }),
      },
    ],
  },
  {
    id: 'execReshuffle',
    title: 'A new VP wants a deep-dive',
    description: 'Leadership just changed upstream. The new VP wants to understand your project personally, this week.',
    weight: 2,
    choices: [
      {
        id: 'deck',
        label: 'Prepare a thorough deck',
        description: 'Your Organization stat decides how sharp it lands.',
        resolve: (ctx) => {
          const success = roll(0.3 + ctx.stats.organization / 150);
          if (success) return { message: 'The deep-dive goes well. The new VP leaves impressed.', trustDeltas: { sponsor: 12 }, percentDelta: -2 };
          return { message: 'The deck is fine, but nothing lands. Neutral impression at best.', percentDelta: -2 };
        },
      },
      {
        id: 'wingit',
        label: 'Wing it in the room',
        description: 'Your Communication stat decides how convincing you are on the fly.',
        resolve: (ctx) => {
          const success = roll(0.25 + ctx.stats.communication / 150);
          if (success) return { message: 'You talk through it comfortably. It works.', trustDeltas: { sponsor: 8 } };
          return { message: 'You stumble on a few numbers. It does not land well.', trustDeltas: { sponsor: -10 } };
        },
      },
      {
        id: 'delegate',
        label: 'Send a team lead instead',
        description: 'Costs you nothing personally, but it is a gamble on how it reads.',
        resolve: () => ({ message: 'Sending someone else reads as distant. The VP notes your absence.', trustDeltas: { sponsor: -6 } }),
      },
    ],
  },
  {
    id: 'burnout',
    title: 'Burnout is showing',
    description: 'One of your developers is visibly running on empty. Output is still fine, for now.',
    weight: 0,
    riskId: 'burnout',
    choices: [
      {
        id: 'timeoff',
        label: 'Mandate time off',
        description: 'Costs a bit of progress now to protect the team long-term.',
        resolve: () => ({ message: 'They take the time and come back steadier.', percentDelta: -4, moraleDelta: 10 }),
      },
      {
        id: 'pushthrough',
        label: 'Push through the deadline',
        description: 'Keeps pace, but the risk compounds.',
        resolve: () => ({ message: 'They push through. It works for now, but morale keeps sliding.', moraleDelta: -14 }),
      },
      {
        id: 'redistributeBurnout',
        label: "Redistribute their tasks",
        description: 'Spread the load across the rest of the team.',
        resolve: () => ({ message: 'The team picks up the slack. Everyone feels it a little.', moraleDelta: -5 }),
      },
    ],
  },
  {
    id: 'complianceScope',
    title: 'Legal flags a compliance gap',
    description: 'A regulatory requirement was never scoped in, and legal just noticed.',
    weight: 0,
    riskId: 'complianceScope',
    choices: [
      {
        id: 'scopeNow',
        label: 'Scope the compliance work now',
        description: 'Costly, but it closes the gap cleanly.',
        resolve: () => ({ message: 'You fold the compliance work into the plan properly.', acDelta: 15000, percentDelta: -6 }),
      },
      {
        id: 'ignoreCompliance',
        label: 'Note it and move on',
        description: 'Defers the cost, but it will resurface, worse.',
        resolve: () => ({ message: 'You table it for later. Legal is not happy, and this is not the last you will hear of it.', trustDeltas: { sponsor: -12 } }),
      },
      {
        id: 'extension',
        label: 'Ask the sponsor for a deadline extension',
        description: 'Your Negotiation stat decides whether they grant it.',
        resolve: (ctx) => {
          const success = roll(0.25 + ctx.stats.negotiation / 150);
          if (success) return { message: 'The sponsor grants a short extension to do it right.', acDelta: 6000, trustDeltas: { sponsor: -4 } };
          return { message: 'The sponsor declines. You absorb the work on the existing timeline.', acDelta: 15000, percentDelta: -8, trustDeltas: { sponsor: -8 } };
        },
      },
    ],
  },
  {
    id: 'designHandoff',
    title: 'The design handoff is incomplete',
    description: 'Half the screens from the external design agency are missing specs.',
    weight: 0,
    riskId: 'thirdPartyDesign',
    choices: [
      {
        id: 'reverseEngineer',
        label: 'Have the team fill the gaps',
        description: 'Uses engineering time to guess at intent.',
        resolve: () => ({ message: 'The team fills in the gaps as best they can. It costs some time.', percentDelta: -5 }),
      },
      {
        id: 'rushFee',
        label: 'Pay the agency a rush fee',
        description: 'Get proper specs, at a price.',
        resolve: () => ({ message: 'The agency delivers finished specs within days.', acDelta: 5000 }),
      },
      {
        id: 'placeholder',
        label: 'Ship with placeholder UI',
        description: 'Keep moving now, fix the look later.',
        resolve: () => ({ message: 'You ship rough edges to stay on schedule. Users notice.', trustDeltas: { endUser: -8 } }),
      },
    ],
  },
  {
    id: 'infraCost',
    title: 'Cloud costs are running hot',
    description: 'This month\'s infrastructure bill came in well over the original estimate.',
    weight: 0,
    riskId: 'infraCost',
    choices: [
      {
        id: 'optimize',
        label: 'Optimize the infrastructure',
        description: "Uses the team's technical time instead of budget.",
        resolve: (ctx) => {
          const strong = avgTechnical(ctx) >= 65;
          if (strong) return { message: 'The team trims the bill without much drama.', percentDelta: -2 };
          return { message: 'Optimizing takes longer than expected.', percentDelta: -6 };
        },
      },
      {
        id: 'absorb',
        label: 'Absorb the extra spend',
        description: 'Simplest option, straight cost.',
        resolve: () => ({ message: 'You pay the difference and move on.', acDelta: 7000 }),
      },
      {
        id: 'downgrade',
        label: 'Downgrade the tier',
        description: 'Saves money, costs performance and goodwill.',
        resolve: () => ({ message: 'The downgrade saves money, but performance suffers and users notice.', trustDeltas: { endUser: -6 } }),
      },
    ],
  },
  {
    id: 'aheadOfPace',
    title: 'The sprint finishes early',
    description: 'For once, everything landed ahead of schedule.',
    weight: 2,
    choices: [
      {
        id: 'bank',
        label: 'Bank the surplus',
        description: 'Keep the buffer for later.',
        resolve: () => ({ message: 'You bank the good week. Every buffer helps eventually.', acDelta: -4000 }),
      },
      {
        id: 'polish',
        label: 'Reinvest in polish',
        description: 'Spend the surplus time on quality instead of banking it.',
        resolve: () => ({ message: 'The extra polish shows. Users notice the care.', trustDeltas: { endUser: 8 } }),
      },
      {
        id: 'halfday',
        label: 'Give the team a half-day off',
        description: 'Spend it on the team instead.',
        resolve: () => ({ message: 'The team appreciates the break. Morale ticks up.', moraleDelta: 10 }),
      },
    ],
  },
];

export const RISK_EVENT_MAP: Record<string, string> = {
  vendorDelay: 'vendorDelay',
  burnout: 'burnout',
  complianceScope: 'complianceScope',
  thirdPartyDesign: 'designHandoff',
  infraCost: 'infraCost',
};

export const FLOATING_EVENTS = EVENTS.filter((e) => e.weight > 0);
