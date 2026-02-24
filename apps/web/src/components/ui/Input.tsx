import type { ComponentProps } from 'react';

export function Input(props: ComponentProps<'input'> & { className?: string }) {
  const { className = '', ...rest } = props;
  return (
    <input
      {...rest}
      className={
        `w-full rounded-lpa border border-lpa-cardBorder bg-lpa-white/0 px-3 py-2 text-sm text-lpa-fg placeholder:text-lpa-mutedFg/70 outline-none focus:border-lpa-accent ${className}`
      }
    />
  );
}

export function TextArea(props: ComponentProps<'textarea'> & { className?: string }) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={
        `w-full min-h-28 rounded-lpa border border-lpa-cardBorder bg-lpa-white/0 px-3 py-2 text-sm text-lpa-fg placeholder:text-lpa-mutedFg/70 outline-none focus:border-lpa-accent ${className}`
      }
    />
  );
}
