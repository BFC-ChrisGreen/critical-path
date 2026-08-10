import { useState } from 'react';
import { useGameStore } from '../store';
import { Pill } from '../components/Pill';
import { Gantt } from '../components/Gantt';
import { EVENTS } from '../data/events';
import { cpi, spi } from '../engine/evm';
import { computeSchedule, criticalPathWeeks } from '../engine/criticalPath';
import { isUnlocked } from '../engine/tasks';
import { deriveSwot, type SwotResult } from '../engine/swot';
import { CONTINGENCY_LABEL } from '../engine/contingency';
import type { Candidate, Task } from '../types';

const SWOT_QUADRANTS: { key: keyof SwotResult; label: string }[] = [
  { key: 'strengths', label: 'Strengths' },
  { key: 'weaknesses', label: 'Weaknesses' },
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'threats', label: 'Threats' },
];

type TabId = 'overview' | 'schedule' | 'tasks' | 'risks' | 'swot' | 'log';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'risks', label: 'Risks' },
  { id: 'swot', label: 'SWOT' },
  { id: 'log', label: 'Log' },
];

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

function TaskBoard({
  tasks,
  team,
  criticalIds,
  assignTask,
  unassignTask,
}: {
  tasks: Task[];
  team: Candidate[];
  criticalIds: Set<string>;
  assignTask: (taskId: string, candidateId: string) => void;
  unassignTask: (taskId: string) => void;
}) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const assignedIds = new Set(tasks.filter((t) => t.assignedTo).map((t) => t.assignedTo as string));
  const freeTeam = team.filter((c) => !assignedIds.has(c.id));

  const todo = tasks.filter((t) => t.status === 'todo');
  const inProgress = tasks.filter((t) => t.status === 'inProgress');
  const done = tasks.filter((t) => t.status === 'done');

  return (
    <div className="task-board">
      <div className="task-column">
        <span className="col-title">To do</span>
        {todo.map((task) => {
          const unlocked = isUnlocked(task, tasks);
          const blockedBy = task.dependencies
            .map((id) => byId.get(id))
            .filter((dep) => dep && dep.status !== 'done')
            .map((dep) => dep!.name);
          return (
            <div className={`task-card ${unlocked ? '' : 'blocked'} ${criticalIds.has(task.id) ? 'critical' : ''}`} key={task.id}>
              <div className="tname">{task.name}</div>
              <div className="test">{task.estimateWeeks}w estimate</div>
              {criticalIds.has(task.id) && <span className="tcritical-tag">Critical path</span>}
              {unlocked ? (
                freeTeam.length > 0 ? (
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) assignTask(task.id, e.target.value);
                    }}
                  >
                    <option value="" disabled>Assign someone&hellip;</option>
                    {freeTeam.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="test">No free team members</div>
                )
              ) : (
                <div className="test">Blocked by: {blockedBy.join(', ')}</div>
              )}
            </div>
          );
        })}
        {todo.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>Nothing queued.</p>}
      </div>

      <div className="task-column">
        <span className="col-title">In progress</span>
        {inProgress.map((task) => {
          const assignee = team.find((c) => c.id === task.assignedTo);
          return (
            <div className={`task-card ${criticalIds.has(task.id) ? 'critical' : ''}`} key={task.id}>
              <div className="tname">{task.name}</div>
              <div className="test">{task.remainingWeeks.toFixed(1)}w remaining</div>
              {criticalIds.has(task.id) && <span className="tcritical-tag">Critical path</span>}
              {assignee && <div className="tassignee">{assignee.name}</div>}
              <button type="button" className="btn unassign-btn" onClick={() => unassignTask(task.id)}>
                Unassign
              </button>
            </div>
          );
        })}
        {inProgress.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>Nothing in progress.</p>}
      </div>

      <div className="task-column">
        <span className="col-title">Done</span>
        {done.map((task) => (
          <div className="task-card" key={task.id}>
            <div className="tname">&#10003; {task.name}</div>
          </div>
        ))}
        {done.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem' }}>Nothing finished yet.</p>}
      </div>
    </div>
  );
}

export function Weekbeat() {
  const project = useGameStore((s) => s.project);
  const morale = useGameStore((s) => s.morale);
  const milestones = useGameStore((s) => s.milestones);
  const tasks = useGameStore((s) => s.tasks);
  const team = useGameStore((s) => s.team);
  const riskRegister = useGameStore((s) => s.riskRegister);
  const stakeholders = useGameStore((s) => s.stakeholders);
  const eventLog = useGameStore((s) => s.eventLog);
  const pendingEvent = useGameStore((s) => s.pendingEvent);
  const history = useGameStore((s) => s.history);
  const advanceWeek = useGameStore((s) => s.advanceWeek);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const assignTask = useGameStore((s) => s.assignTask);
  const unassignTask = useGameStore((s) => s.unassignTask);
  const [tab, setTab] = useState<TabId>('overview');

  const cpiVal = cpi(project);
  const spiVal = spi(project);
  const activeEvent = pendingEvent ? EVENTS.find((e) => e.id === pendingEvent.eventId) : null;
  const schedule = computeSchedule(tasks);
  const criticalIds = new Set(Object.entries(schedule).filter(([, s]) => s.isCritical).map(([id]) => id));
  const criticalWeeks = criticalPathWeeks(tasks);
  const swot = deriveSwot({ team, morale, project, riskRegister, stakeholders, milestones });
  const overallTone = tone(Math.min(cpiVal, spiVal));

  return (
    <div className="stack" style={{ gap: '1.2rem' }}>
      <div className="stat-strip">
        <div className="stat-row">
          <div className="stat-tile"><div className="label">CPI</div><div className={`value ${tone(cpiVal)}`}>{cpiVal.toFixed(2)}</div></div>
          <div className="stat-tile"><div className="label">SPI</div><div className={`value ${tone(spiVal)}`}>{spiVal.toFixed(2)}</div></div>
          <div className="stat-tile"><div className="label">Earned</div><div className="value">{Math.round(project.percentComplete)}%</div></div>
          <div className="stat-tile"><div className="label">Actual cost</div><div className="value">{money(project.ac)}</div></div>
          <div className="stat-tile"><div className="label">Morale</div><div className={`value ${morale >= 60 ? 'good' : morale >= 35 ? 'warn' : 'risk'}`}>{Math.round(morale)}</div></div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-panel" key={tab}>
        {tab === 'overview' && (
          <div className="stack" style={{ gap: '1.2rem' }}>
            <div className="panel">
              <div className="row-between">
                <span className="eyebrow">Status</span>
                <Pill tone={overallTone}>{overallTone === 'good' ? 'On track' : overallTone === 'warn' ? 'At risk' : 'Critical'}</Pill>
              </div>
              <Sparkline history={history} durationWeeks={project.durationWeeks} budget={project.budget} />
            </div>

            <div className="panel stack">
              <span className="eyebrow">Milestones</span>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Milestone</th><th>Target week</th><th>Status</th></tr></thead>
                  <tbody>
                    {milestones.map((m) => (
                      <tr key={m.id}>
                        <td>{m.label}</td>
                        <td className="num">wk {m.targetWeek}</td>
                        <td>
                          {project.week > m.targetWeek ? (
                            <Pill tone="good">Passed</Pill>
                          ) : project.week === m.targetWeek ? (
                            <Pill tone="warn">Due this week</Pill>
                          ) : (
                            <span style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>Upcoming</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'schedule' && (
          <div className="panel stack">
            <div className="row-between">
              <span className="eyebrow">Schedule</span>
              <Pill tone={criticalWeeks > project.durationWeeks ? 'risk' : 'good'}>
                Critical path: {criticalWeeks.toFixed(1)} / {project.durationWeeks}w
              </Pill>
            </div>
            <Gantt tasks={tasks} durationWeeks={project.durationWeeks} currentWeek={project.week} />
          </div>
        )}

        {tab === 'tasks' && (
          <div className="panel stack">
            <span className="eyebrow">Task board</span>
            <TaskBoard tasks={tasks} team={team} criticalIds={criticalIds} assignTask={assignTask} unassignTask={unassignTask} />
          </div>
        )}

        {tab === 'risks' && (
          <div className="grid-2">
            <div className="panel stack">
              <span className="eyebrow">Risk register</span>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Risk</th><th>Status</th><th>Contingency</th></tr></thead>
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
                        <td style={{ color: r.contingency ? 'var(--text)' : 'var(--text-faint)', fontSize: '0.85rem' }}>
                          {r.contingency ? CONTINGENCY_LABEL[r.contingency] : 'None'}
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
        )}

        {tab === 'swot' && (
          <div className="panel stack">
            <span className="eyebrow">SWOT</span>
            <div className="swot-grid">
              {SWOT_QUADRANTS.map(({ key, label }) => (
                <div className={`swot-quadrant ${key}`} key={key}>
                  <h4>{label}</h4>
                  <ul>
                    {swot[key].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'log' && (
          <div className="panel stack">
            <span className="eyebrow">Log</span>
            <div className="log-list">
              {eventLog.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.88rem' }}>Nothing has happened yet. Advance the week to begin.</p>}
              {[...eventLog].reverse().map((entry, i) => (
                <div className={`log-entry ${entry.kind}`} key={i}>
                  <span className="lkind">Week {entry.week} &middot; {entry.kind}</span>
                  <div className="ltitle">{entry.title}</div>
                  <div className="lmsg">{entry.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="action-bar">
        <div className="action-bar-inner">
          <span className="action-bar-meta">Week {project.week} of {project.durationWeeks}</span>
          <button type="button" className="btn btn-primary" onClick={advanceWeek} disabled={!!pendingEvent}>
            Advance week
          </button>
        </div>
      </div>

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
