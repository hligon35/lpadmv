import type { ReactNode } from 'react';

export function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div
      className={
        `rounded-lpa border border-lpa-cardBorder bg-lpa-card p-5 ${props.className ?? ''}`
      }
    >
      {props.children}
    </div>
  );
}
