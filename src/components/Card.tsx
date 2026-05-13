import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'soft' | 'accent' | 'berry' | 'green';
  children: ReactNode;
  className?: string;
}

export function Card({ title, icon, variant = 'default', children, className = '' }: CardProps) {
  const v = variant === 'default' ? '' : `card--${variant}`;
  return (
    <section className={`card ${v} ${className}`.trim()}>
      {title && (
        <h3 className="card__title">
          {icon && <span className="icon">{icon}</span>}
          <span>{title}</span>
        </h3>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
