import { useGameStore } from '../store';
import { Pill } from '../components/Pill';
import { EVENTS } from '../data/events';
import { cpi, spi } from '../engine/evm';

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

function tone(value: number): 'good' | 'warn' | 'risk' {
  if (value >= 0.98) return 'good';
  if (value >= 0.85) return 'warn';
  return 'risk';
}

function Sparkline({ history, durationWeeks, budget }: { history: { week: number; percentComplete: number }[]; durationWeeks: number; budget: number }) {
  const width = 200;
  const height = 44;
  const points = history.length > 0 ? history : [{ week: 0, percentComplete: 0 }];
  const maxWeek = durationWeeks;

  const actual = points
    .map((p) => `${(p.week / maxWeek) * width},${height - (p.percentComplete / 100) * height}`)
    .join(' ');
  const planned = [0, maxWeek]
    .map((w) => `${(w / maxWeek) * width},${height - (w / maxWeek) * height}`)
    .join(' ');

  return (
    <div className="row" style={{ marginTop: '0.9rem', gap: '1rem' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Progress versus plan">
        <polyline points={planned} fill="none" stroke="var(--text-faint)" strokeWidth={1.5} strokeDasharray="3,3" />
        <polyline points={actual} fill="none" stroke="var(--accent)" strokeWidth={2} />
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
        &#9644; actual &nbsp; &#9481;&#9481; planned
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-faint)', marginLeft: 'auto' }}>
        {money((points[points.length - 1]?.percentComplete ?? 0) / 100 * budget)} earned
      </span>
    </div>
  );
}

export function Weekbeat() {
  const project = useGameStore((s) => s.project);
  const morale = useGameStore((s) => s.morale);
  const riskRegister = useGameStore((s) => s.riskRegister);
  const stakeholders = useGameStore((s) => s.stakeholders);
  const eventLog = useGameStore((s) => s.eventLog);
  const pendingEvent = useGameStore((s) => s.pendingEvent);
  const history = useGameStore((s) => s.history);
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const resolveEvent = useGameStore((s) => s.resolveEvent);

  const cpiVal = cpi(project);
  const spiVal = spi(project);
  const activeEvent = pendingEvent ? EVENTS.find((e) => e.id === pendingEvent.eventId) : null;

  return (
    <div className="stack" style={{ gap: '1.6rem' }}>
      <div className="panel">
        <div className="row-between">
          <span className="eyebrow">Weekly dashboard</span>
          <Pill tone={tone(Math.min(cpiVal, spiVal))}>
            {Math.min(cpiVal, spiVal) >= 0.98 ? 'On track' : Math.min(cpiVal, spiVal) >= 0.85 ? 'At risk' : 'Critical'}
          </Pill>
        </div>
        <div className="stat-row" style={{ marginTop: '0.9rem' }}>
          <div className="stat-tile"><div className="label">CPI</div><div className={`value ${tone(cpiVal)}`}>{cpiVal.toFixed(2)}</div></div>
          <div className="stat-tile"><div className="label">SPI</div><div className={`value ${tone(spiVal)}`}>{spiVal.toFixed(2)}</div></div>
          <div className="stat-tile"><div className="label">Earned</div><div className="value">{Math.round(project.percentComplete)}%</div></div>
          <div className="stat-tile"><div className="label">Actual cost</div><div className="value">{money(project.ac)}</div></div>
          <div className="stat-tile"><div className="label">Morale</div><div className={`value ${morale >= 60 ? 'good' : morale >= 35 ? 'warn' : 'risk'}`}>{Math.round(morale)}</div></div>
        </div>
        <Sparkline history={history} durationWeeks={project.durationWeeks} budget={project.budget} />
      </div>

      <div className="grid-2">
        <div className="panel stack">
          <span className="eyebrow">Risk register</span>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Risk</th><th>Status</th></tr></thead>
              <tbody>
                {riskRegister.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>
                      {r.triggered ? (
                        <Pill tone="risk">Triggered</Pill>
                      ) : r.mitigated ? (
                        <Pill tone="good">Mitigated</Pill>
                      ) : (
                        <Pill tone="warn">Watching</Pill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel stack">
          <span className="eyebrow">Stakeholder trust</span>
          {stakeholders.map((s) => (
            <div className="trust-row" key={s.id}>
              <span className="tname">{s.name}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${s.trust}%`,
                    background: s.trust >= 60 ? 'var(--good)' : s.trust >= 30 ? 'var(--warn)' : 'var(--risk)',
                  }}
                />
              </div>
              <span className="tval">{Math.round(s.trust)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel stack">
        <span className="eyebrow">Log</span>
        <div className="log-list">
          {eventLog.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.88rem' }}>Nothing has happened yet. Advance the week to begin.</p>}
          {[...eventLog].reverse().map((entry, i) => (
            <div className={`log-entry ${entry.kind}`} key={i}>
              <div className="lweek">Week {entry.week}</div>
              <div className="ltitle">{entry.title}</div>
              <div className="lmsg">{entry.message}</div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={advanceWeek} disabled={!!pendingEvent}>
        Advance week
      </button>

      {activeEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <span className="eyebrow">Week {project.week}</span>
            <h3>{activeEvent.title}</h3>
            <p className="desc">{activeEvent.description}</p>
            {activeEvent.choices.map((choice) => (
              <button key={choice.id} type="button" className="choice-btn" onClick={() => resolveEvent(choice.id)}>
                <div className="clabel">{choice.label}</div>
                <div className="cdesc">{choice.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
