function formatInteger(value: number) {
  return String(Math.round(Math.abs(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Keep currency text identical in server-rendered and browser-hydrated markup. */
export function formatRupiah(value: number) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${amount < 0 ? "-" : ""}Rp ${formatInteger(amount)}`;
}

/** Compact Indonesian chart labels without locale-dependent spaces or abbreviations. */
export function formatCompactNumber(value: number) {
  const amount = Number.isFinite(value) ? value : 0;
  const absolute = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (absolute >= 1_000_000_000) return `${sign}${formatInteger(amount / 1_000_000_000)} miliar`;
  if (absolute >= 1_000_000) return `${sign}${formatInteger(amount / 1_000_000)} jt`;
  if (absolute >= 1_000) return `${sign}${formatInteger(amount / 1_000)} rb`;
  return `${sign}${formatInteger(amount)}`;
}
