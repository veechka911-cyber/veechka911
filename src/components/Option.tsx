import type { ReactNode } from 'react';

interface OptionProps {
  selected?: boolean;
  onClick: () => void;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export function Option({ selected, onClick, label, description, icon }: OptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`option ${selected ? 'option--selected' : ''}`}
      aria-pressed={!!selected}
    >
      <div className="option__label">
        {icon && <span aria-hidden>{icon}</span>}
        <span>{label}</span>
      </div>
      {description && <div className="option__desc">{description}</div>}
    </button>
  );
}
