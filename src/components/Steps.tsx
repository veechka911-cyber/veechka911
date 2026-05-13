interface Props {
  total: number;
  current: number; // 0-based
}

export function Steps({ total, current }: Props) {
  return (
    <div className="steps" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
      {Array.from({ length: total }).map((_, i) => {
        const state = i < current ? 'steps__dot--done' : i === current ? 'steps__dot--active' : '';
        return <span key={i} className={`steps__dot ${state}`} />;
      })}
    </div>
  );
}
