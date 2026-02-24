import Link from 'next/link';
import type { ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'accent' | 'ghost';

type BaseProps = {
  variant?: ButtonVariant;
  className?: string;
};

function variantClass(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return 'bg-lpa-primary text-lpa-white hover:bg-lpa-primary/90';
    case 'accent':
      return 'bg-lpa-accent text-lpa-black hover:bg-lpa-accent/90';
    case 'ghost':
    default:
      return 'bg-lpa-white/0 text-lpa-fg hover:bg-lpa-white/5 border border-lpa-cardBorder/80';
  }
}

export function Button(props: ComponentProps<'button'> & BaseProps) {
  const { variant = 'primary', className = '', ...rest } = props;
  return (
    <button
      {...rest}
      className={
        `inline-flex items-center justify-center rounded-lpa px-4 py-2 text-sm font-semibold transition ${variantClass(variant)} ${className}`
      }
    />
  );
}

export function ButtonLink(
  props: ComponentProps<typeof Link> & BaseProps & { href: string },
) {
  const { variant = 'primary', className = '', ...rest } = props;
  return (
    <Link
      {...rest}
      className={
        `inline-flex items-center justify-center rounded-lpa px-4 py-2 text-sm font-semibold transition ${variantClass(variant)} ${className}`
      }
    />
  );
}
