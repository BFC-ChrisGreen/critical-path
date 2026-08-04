import { useGameStore } from '../store';
import { cpi, spi, scoreToGrade, gradeTone } from '../engine/evm';
import { EVENTS, RISK_EVENT_MAP } from '../data/events';

const GAME_OVER_COPY: Record<string, { title: string; body: string }> = {
  delivered: { title: 'Delivered', body: 'The timeline ran its course. Here is how it went.' },
  cancelled: { title: 'Project cancelled', body: 'A stakeholder pulled support before the finish line.' },
  bankrupt: { title: 'Budget exhausted', body: 'Actual cost ran past what the organization would cover.' },
};

export function Debrief() {
  const project = useGameStore((s) => s.project);
  const morale = useGameStore((s) => s.morale);
  const stakeholders = useGameStore((s) => s.stakeholders);
  const riskRegister = useGameStore((s) => s.riskRegister);
  const eventLog = useGameStore((s) => s.eventLog);
  const gameOver = useGameStore((s) => s.gameOver);
  const resetGame = useGameStore((s) => s.resetGame);

  const cpiVal = cpi(project);
  const spiVal = spi(project);
  const avgTrust = stakeholders.reduce((sum, s) => sum + s.trust, 0) / stakeholders.length;

  const timeGrade = scoreToGrade(gameOver === 'bankrupt' ? 30 : spiVal * 100);
  const budgetGrade = scoreToGrade(gameOver === 'bankrupt' ? 15 : cpiVal * 100);
  const scopeGrade = scoreToGrade(project.percentComplete);
  const moraleGrade = scoreToGrade(morale);
  const trustGrade = scoreToGrade(gameOver === 'cancelled' ? 0 : avgTrust);

  const notes = riskRegister
    .filter((r) => r.triggered && !r.mitigated)
    .map((r) => {
      const eventId = RISK_EVENT_MAP[r.id];
      const eventDef = EVENTS.find((e) => e.id === eventId);
      const logEntry = [...eventLog].reverse().find((e) => e.title === eventDef?.title);
      return {
        risk: r,
        message: logEntry
          ? `"${r.name}" was flagged ${Math.round(r.probability * 100)}% likely and left unmitigated at kickoff. It triggered in week ${logEntry.week}: ${logEntry.message}`
          : `"${r.name}" was flagged ${Math.round(r.probability * 100)}% likely and left unmitigated. It went on to trigger.`,
      };
    });

  const copy = GAME_OVER_COPY[gameOver ?? 'delivered'];

  return (
    <div className="stack" style={{ gap: '1.6rem' }}>
      <div>
        <span className="eyebrow">Debrief</span>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 0.3rem' }}>{copy.title}</h1>
        <p style={{ color: 'var(--text-dim)' }}>{copy.body}</p>
      </div>

      <div className="scorecard">
        <div className="score-tile"><div className={`grade ${gradeTone(timeGrade)}`}>{timeGrade}</div><div className="glabel">Time</div></div>
        <div className="score-tile"><div className={`grade ${gradeTone(budgetGrade)}`}>{budgetGrade}</div><div className="glabel">Budget</div></div>
        <div className="score-tile"><div className={`grade ${gradeTone(scopeGrade)}`}>{scopeGrade}</div><div className="glabel">Scope</div></div>
        <div className="score-tile"><div className={`grade ${gradeTone(moraleGrade)}`}>{moraleGrade}</div><div className="glabel">Morale</div></div>
        <div className="score-tile"><div className={`grade ${gradeTone(trustGrade)}`}>{trustGrade}</div><div className="glabel">Trust</div></div>
      </div>

      <div className="panel stack">
        <span className="eyebrow">What happened</span>
        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem' }}>
            Every high-probability risk you flagged at kickoff either got mitigated or never came up. That is the game working as intended.
          </p>
        ) : (
          notes.map((n) => (
            <div className="debrief-note" key={n.risk.id}>{n.message}</div>
          ))
        )}
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={resetGame}>
        Start a new project
      </button>
    </div>
  );
}
