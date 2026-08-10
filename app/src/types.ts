export type StatKey =
  | 'leadership'
  | 'technical'
  | 'communication'
  | 'riskMgmt'
  | 'negotiation'
  | 'organization';

export type Stats = Record<StatKey, number>;

export type Background = 'engineer' | 'analyst' | 'scrumMaster';

export type TraitId = 'mentor' | 'burnoutRisk' | 'maverick' | 'grinder' | 'primaDonna';

export interface Candidate {
  id: string;
  name: string;
  role: string;
  technical: number;
  communication: number;
  reliability: number;
  costPerWeek: number;
  trait: TraitId;
}

export type ImpactLevel = 'low' | 'medium' | 'high';

export interface Risk {
  id: string;
  name: string;
  probability: number;
  impact: ImpactLevel;
  mitigationCost: number;
  mitigated: boolean;
  triggered: boolean;
}

export type StakeholderId = 'sponsor' | 'productOwner' | 'endUser';

export interface Stakeholder {
  id: StakeholderId;
  name: string;
  role: string;
  trust: number;
}

export interface LogEntry {
  week: number;
  title: string;
  message: string;
  kind: 'event' | 'review' | 'system';
}

export type Screen = 'intro' | 'personality' | 'create' | 'kickoff' | 'weekbeat' | 'debrief';

export interface Character {
  name: string;
  background: Background;
  stats: Stats;
}

export interface ProjectState {
  name: string;
  brief: string;
  durationWeeks: number;
  budget: number;
  teamCap: number;
  week: number;
  ac: number;
  percentComplete: number;
}

export type GameOverReason = 'delivered' | 'cancelled' | 'bankrupt' | null;

export interface PendingEvent {
  eventId: string;
}

export interface HistoryPoint {
  week: number;
  ac: number;
  percentComplete: number;
}

export interface GameState {
  screen: Screen;
  personalityAllocation: Stats | null;
  character: Character | null;
  project: ProjectState;
  team: Candidate[];
  candidatePool: Candidate[];
  riskRegister: Risk[];
  stakeholders: Stakeholder[];
  morale: number;
  eventLog: LogEntry[];
  pendingEvent: PendingEvent | null;
  gameOver: GameOverReason;
  history: HistoryPoint[];
}

export interface ResolveOutcome {
  message: string;
  acDelta?: number;
  moraleDelta?: number;
  percentDelta?: number;
  trustDeltas?: Partial<Record<StakeholderId, number>>;
}

export interface ResolveCtx {
  stats: Stats;
  team: Candidate[];
  project: ProjectState;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  resolve: (ctx: ResolveCtx) => ResolveOutcome;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  riskId?: string;
  weight: number;
  requiresTrait?: TraitId;
  choices: EventChoice[];
}
