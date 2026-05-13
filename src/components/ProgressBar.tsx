interface ProgressProps {
  value: number; // 0..100
  label?: string;
  tone?: 'green' | 'berry';
}

export function ProgressBar({ value, label, tone = 'green' }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {(label || true) && (
        <div className="progress__label">
          <span>{label ?? 'Баланс'}</span>
          <span className="progress__value">{clamped}%</span>
        </div>
      )}
      <div className={`progress ${tone === 'berry' ? 'progress--berry' : ''}`}>
        <div className="progress__bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
