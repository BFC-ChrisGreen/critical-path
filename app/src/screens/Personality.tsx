import { useState } from 'react';
import { useGameStore } from '../store';
import { PERSONALITY_QUESTIONS, ROLE_BLURB, ROLE_LABEL } from '../data/quiz';
import type { Stats, StatKey } from '../types';
import { Bar } from '../components/Bar';

const STAT_ORDER: { key: StatKey; label: string }[] = [
  { key: 'leadership', label: 'Leadership' },
  { key: 'technical', label: 'Technical Acumen' },
  { key: 'communication', label: 'Communication' },
  { key: 'riskMgmt', label: 'Risk Management' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'organization', label: 'Organization' },
];

const EMPTY_STATS: Stats = {
  leadership: 0,
  technical: 0,
  communication: 0,
  riskMgmt: 0,
  negotiation: 0,
  organization: 0,
};

export function Personality() {
  const completePersonality = useGameStore((s) => s.completePersonality);
  const [index, setIndex] = useState(0);
  const [allocation, setAllocation] = useState<Stats>({ ...EMPTY_STATS });
  const [done, setDone] = useState(false);

  const question = PERSONALITY_QUESTIONS[index];
  const isLast = index === PERSONALITY_QUESTIONS.length - 1;

  function pick(deltas: Partial<Record<StatKey, number>>) {
    setAllocation((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(deltas) as StatKey[]) {
        next[key] = next[key] + (deltas[key] ?? 0);
      }
      return next;
    });
    if (isLast) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (done) {
    const topStat = STAT_ORDER.reduce((top, cur) => (allocation[cur.key] > allocation[top.key] ? cur : top)).key;
    return (
      <div className="stack" style={{ gap: '2rem' }}>
        <div>
          <span className="eyebrow">Results</span>
          <h1 style={{ fontSize: '2.1rem', margin: '0.5rem 0 0.3rem' }}>{ROLE_LABEL[topStat]}</h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: '60ch' }}>{ROLE_BLURB[topStat]}</p>
        </div>

        <div className="panel stack">
          <span className="eyebrow">Your instincts</span>
          {STAT_ORDER.map(({ key, label }) => (
            <div className="stat-alloc" key={key}>
              <span className="sname">{label}</span>
              <Bar value={allocation[key]} max={6} />
              <span className="stat-value">{allocation[key]}</span>
            </div>
          ))}
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>
            These carry over as a starting boost — you'll still pick a background and can fine-tune from there.
          </p>
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={() => completePersonality(allocation)}>
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <div>
        <span className="eyebrow">
          Personality test &middot; {index + 1} / {PERSONALITY_QUESTIONS.length}
        </span>
        <h1 style={{ fontSize: '2.1rem', margin: '0.5rem 0 0.3rem' }}>How do you work?</h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '60ch' }}>
          There's no wrong answer here — this just shapes where you'll naturally lean once the project starts.
        </p>
      </div>

      <div className="panel stack">
        <p style={{ fontWeight: 600 }}>{question.prompt}</p>
        {question.options.map((opt) => (
          <button key={opt.id} type="button" className="choice-btn" onClick={() => pick(opt.deltas)}>
            <div className="clabel">{opt.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
