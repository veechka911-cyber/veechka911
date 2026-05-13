import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'olive' | 'ghost';

interface BaseProps {
  variant?: Variant;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' ? 'btn--sm' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

interface LinkButtonProps extends BaseProps {
  to: string;
  external?: boolean;
}

export function LinkButton({ to, external, variant = 'primary', size = 'md', children }: LinkButtonProps) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' ? 'btn--sm' : ''].filter(Boolean).join(' ');
  if (external) {
    return (
      <a className={cls} href={to} target="_blank" rel="noreferrer" style={{ borderBottom: 0 }}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} to={to} style={{ borderBottom: 0 }}>
      {children}
    </Link>
  );
}
