/** Format a dollar amount as USD display text. */
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Format integer cents as USD display text. */
export function formatUsdFromCents(cents: number): string {
  return formatUsd(cents / 100);
}
