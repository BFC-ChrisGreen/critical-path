import { useGameStore } from '../store';
import { Pill } from '../components/Pill';
import { Bar } from '../components/Bar';
import { TRAIT_BLURB, TRAIT_LABEL } from '../data/candidates';
import { PROJECT_TEMPLATES } from '../data/projects';
import { weeklyPayroll } from '../engine/evm';
import type { ImpactLevel } from '../types';

const IMPACT_TONE: Record<ImpactLevel, 'good' | 'warn' | 'risk'> = {
  low: 'good',
  medium: 'warn',
  high: 'risk',
};

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function Kickoff() {
  const projectId = useGameStore((s) => s.projectId);
  const project = useGameStore((s) => s.project);
  const milestones = useGameStore((s) => s.milestones);
  const riskRegister = useGameStore((s) => s.riskRegister);
  const candidatePool = useGameStore((s) => s.candidatePool);
  const team = useGameStore((s) => s.team);
  const chooseProject = useGameStore((s) => s.chooseProject);
  const setMilestoneWeek = useGameStore((s) => s.setMilestoneWeek);
  const toggleMitigate = useGameStore((s) => s.toggleMitigate);
  const hireCandidate = useGameStore((s) => s.hireCandidate);
  const releaseCandidate = useGameStore((s) => s.releaseCandidate);
  const startProject = useGameStore((s) => s.startProject);

  const spentOnMitigation = project.ac;
  const remainingBudget = project.budget - spentOnMitigation;
  const payroll = weeklyPayroll(team);
  const teamFull = team.length >= project.teamCap;

  if (!projectId) {
    return (
      <div className="stack" style={{ gap: '2rem' }}>
        <div>
          <span className="eyebrow">Promotion</span>
          <h1 style={{ fontSize: '2.1rem', margin: '0.5rem 0 0.4rem' }}>You've been made PM. Pick your project.</h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: '60ch' }}>
            Three briefs landed on your desk. Whichever you take runs for its full duration — choose carefully,
            there's no switching once you commit.
          </p>
        </div>
        <div className="bg-options">
          {PROJECT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className="bg-card"
              onClick={() => chooseProject(tpl.id)}
            >
              <h4>{tpl.name}</h4>
              <p>{tpl.brief}</p>
              <div className="row" style={{ marginTop: '0.8rem', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                  {money(tpl.budget)} &middot; {tpl.durationWeeks}w &middot; team of {tpl.teamCap}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <div>
        <span className="eyebrow">Kickoff</span>
        <h1 style={{ fontSize: '2rem', margin: '0.5rem 0 0.4rem' }}>{project.name}</h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '64ch' }}>{project.brief}</p>
      </div>

      <div className="stat-row">
        <div className="stat-tile"><div className="label">Budget</div><div className="value">{money(project.budget)}</div></div>
        <div className="stat-tile"><div className="label">Duration</div><div className="value">{project.durationWeeks}w</div></div>
        <div className="stat-tile"><div className="label">Team cap</div><div className="value">{project.teamCap}</div></div>
        <div className="stat-tile"><div className="label">Spent so far</div><div className="value">{money(spentOnMitigation)}</div></div>
        <div className="stat-tile"><div className="label">Weekly payroll</div><div className="value">{money(payroll)}</div></div>
      </div>

      <div className="panel stack">
        <div>
          <span className="eyebrow">Risk register</span>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
            Mitigating a risk now spends budget up front but cuts its chance of triggering later by roughly
            four-fifths. Anything you leave unaddressed still might never happen, but if it does, it costs more.
          </p>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Risk</th><th>Odds over the project</th><th>Impact</th><th>Mitigation cost</th><th>Status</th></tr>
            </thead>
            <tbody>
              {riskRegister.map((risk) => (
                <tr key={risk.id}>
                  <td>{risk.name}</td>
                  <td className="num">{Math.round(risk.probability * 100)}%</td>
                  <td><Pill tone={IMPACT_TONE[risk.impact]}>{risk.impact}</Pill></td>
                  <td className="num">{money(risk.mitigationCost)}</td>
                  <td>
                    <button type="button" className="btn" onClick={() => toggleMitigate(risk.id)}>
                      {risk.mitigated ? 'Mitigated ✓' : 'Mitigate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
          Remaining budget after mitigation spend: {money(remainingBudget)}
        </p>
      </div>

      <div className="stack">
        <div className="row-between">
          <span className="eyebrow">Hire your team</span>
          <span className="status">{team.length} / {project.teamCap} hired</span>
        </div>

        {team.length > 0 && (
          <div className="candidates">
            {team.map((c) => (
              <div className="candidate hired" key={c.id}>
                <div className="cost">{money(c.costPerWeek)}/wk</div>
                <div className="cname">{c.name}</div>
                <div className="crole">{c.role}</div>
                <div className="bar-row"><span className="bname">Technical</span><Bar value={c.technical} /><span className="bval">{c.technical}</span></div>
                <div className="bar-row"><span className="bname">Comms</span><Bar value={c.communication} /><span className="bval">{c.communication}</span></div>
                <div className="bar-row"><span className="bname">Reliability</span><Bar value={c.reliability} /><span className="bval">{c.reliability}</span></div>
                <span className="trait-chip" title={TRAIT_BLURB[c.trait]}>{TRAIT_LABEL[c.trait]}</span>
                <button type="button" className="btn hire-btn" onClick={() => releaseCandidate(c.id)}>Release</button>
              </div>
            ))}
          </div>
        )}

        <div className="candidates">
          {candidatePool.map((c) => (
            <div className="candidate" key={c.id}>
              <div className="cost">{money(c.costPerWeek)}/wk</div>
              <div className="cname">{c.name}</div>
              <div className="crole">{c.role}</div>
              <div className="bar-row"><span className="bname">Technical</span><Bar value={c.technical} /><span className="bval">{c.technical}</span></div>
              <div className="bar-row"><span className="bname">Comms</span><Bar value={c.communication} /><span className="bval">{c.communication}</span></div>
              <div className="bar-row"><span className="bname">Reliability</span><Bar value={c.reliability} /><span className="bval">{c.reliability}</span></div>
              <span className="trait-chip" title={TRAIT_BLURB[c.trait]}>{TRAIT_LABEL[c.trait]}</span>
              <button type="button" className="btn btn-primary hire-btn" onClick={() => hireCandidate(c.id)} disabled={teamFull}>
                {teamFull ? 'Team full' : 'Hire'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel stack">
        <div>
          <span className="eyebrow">Milestones</span>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
            Set the week you're targeting for each. These track on the weekly dashboard once the project starts.
          </p>
        </div>
        {milestones.map((m) => (
          <div className="stat-alloc" key={m.id}>
            <span className="sname">{m.label}</span>
            <Bar value={m.targetWeek} max={project.durationWeeks} />
            <div className="controls">
              <span className="stat-value">wk {m.targetWeek}</span>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setMilestoneWeek(m.id, m.targetWeek - 1)}
                disabled={m.targetWeek <= 1}
              >
                −
              </button>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setMilestoneWeek(m.id, m.targetWeek + 1)}
                disabled={m.targetWeek >= project.durationWeeks}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={startProject}>
        Start the project
      </button>
    </div>
  );
}
