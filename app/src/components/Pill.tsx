import type { ReactNode } from 'react';

type Tone = 'good' | 'warn' | 'risk';

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
