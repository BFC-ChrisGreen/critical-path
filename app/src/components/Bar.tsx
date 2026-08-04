interface BarProps {
  value: number;
  max?: number;
  color?: string;
}

export function Bar({ value, max = 100, color }: BarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
