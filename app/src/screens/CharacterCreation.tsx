import { useState } from 'react';
import { useGameStore } from '../store';
import { BACKGROUND_BASE_STATS, BACKGROUND_BLURB, BACKGROUND_LABEL, ALLOCATABLE_POINTS } from '../data/backgrounds';
import type { Background, StatKey } from '../types';
import { Bar } from '../components/Bar';

const STAT_ORDER: { key: StatKey; label: string }[] = [
  { key: 'leadership', label: 'Leadership' },
  { key: 'technical', label: 'Technical Acumen' },
  { key: 'communication', label: 'Communication' },
  { key: 'riskMgmt', label: 'Risk Management' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'organization', label: 'Organization' },
];

export function CharacterCreation() {
  const createCharacter = useGameStore((s) => s.createCharacter);
  const [name, setName] = useState('');
  const [background, setBackground] = useState<Background>('engineer');
  const [allocated, setAllocated] = useState<Record<StatKey, number>>({
    leadership: 0,
    technical: 0,
    communication: 0,
    riskMgmt: 0,
    negotiation: 0,
    organization: 0,
  });

  const base = BACKGROUND_BASE_STATS[background];
  const spent = Object.values(allocated).reduce((a, b) => a + b, 0);
  const remaining = ALLOCATABLE_POINTS - spent;

  function changeBackground(next: Background) {
    setBackground(next);
    setAllocated({ leadership: 0, technical: 0, communication: 0, riskMgmt: 0, negotiation: 0, organization: 0 });
  }

  function bump(key: StatKey, delta: number) {
    setAllocated((prev) => {
      const nextVal = prev[key] + delta;
      if (nextVal < 0) return prev;
      if (delta > 0 && remaining <= 0) return prev;
      if (base[key] + nextVal > 100) return prev;
      return { ...prev, [key]: nextVal };
    });
  }

  function handleStart() {
    const finalStats = STAT_ORDER.reduce((acc, { key }) => {
      acc[key] = base[key] + allocated[key];
      return acc;
    }, {} as Record<StatKey, number>);
    createCharacter(name.trim() || 'Jordan Vance', background, finalStats);
  }

  return (
    <div className="stack" style={{ gap: '2rem' }}>
      <div>
        <span className="eyebrow">New career &middot; PM</span>
        <h1 style={{ fontSize: '2.1rem', margin: '0.5rem 0 0.3rem' }}>Who are you?</h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '60ch' }}>
          Every PM starts somewhere. Your background sets your natural strengths. The points are yours to
          spend on top of that.
        </p>
      </div>

      <div className="panel stack">
        <label className="eyebrow" htmlFor="pm-name">Name</label>
        <input
          id="pm-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Vance"
          maxLength={28}
          style={{
            padding: '0.6rem 0.8rem',
            borderRadius: 7,
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            fontSize: '0.95rem',
          }}
        />
      </div>

      <div className="stack">
        <span className="eyebrow">Background</span>
        <div className="bg-options">
          {(Object.keys(BACKGROUND_LABEL) as Background[]).map((key) => (
            <button
              key={key}
              type="button"
              className={`bg-card ${background === key ? 'selected' : ''}`}
              onClick={() => changeBackground(key)}
            >
              <h4>{BACKGROUND_LABEL[key]}</h4>
              <p>{BACKGROUND_BLURB[key]}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="panel stack">
        <div className="row-between">
          <span className="eyebrow">Stat allocation</span>
          <span className="status" style={{ fontFamily: 'var(--font-mono)' }}>{remaining} points left</span>
        </div>
        {STAT_ORDER.map(({ key, label }) => {
          const value = base[key] + allocated[key];
          return (
            <div className="stat-alloc" key={key}>
              <span className="sname">{label}</span>
              <Bar value={value} />
              <div className="controls">
                <span className="stat-value">{value}</span>
                <button type="button" className="stepper-btn" onClick={() => bump(key, -1)} disabled={allocated[key] <= 0}>−</button>
                <button type="button" className="stepper-btn" onClick={() => bump(key, 1)} disabled={remaining <= 0 || base[key] + allocated[key] >= 100}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="btn btn-primary btn-block" onClick={handleStart}>
        Take the job
      </button>
    </div>
  );
}
