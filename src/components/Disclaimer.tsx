import type { ReactNode } from 'react';

interface Props {
  variant?: 'default' | 'soft';
  children: ReactNode;
}

export function Disclaimer({ variant = 'default', children }: Props) {
  return <div className={`disclaimer ${variant === 'soft' ? 'disclaimer--soft' : ''}`}>{children}</div>;
}

export const FullDisclaimerText =
  'Сервис предоставляет примерную информационно-образовательную оценку рациона по фото. Расчёты калорийности и КБЖУ являются ориентировочными и не могут считаться точными. Сервис не является медицинской консультацией, диагностикой, лечением, назначением питания, терапии, препаратов или БАДов и не заменяет очный приём врача. Решения по диагностике, лечению, обследованиям, препаратам, БАДам и индивидуальному питанию принимаются совместно с лечащим врачом.';
