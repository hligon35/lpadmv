export function formatUsdFromCents(amountCents: number | undefined): string {
  if (typeof amountCents !== 'number' || !Number.isFinite(amountCents)) return '$—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountCents / 100);
}
