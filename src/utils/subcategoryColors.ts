/** Preset accents (same order as previous id % palette). */
export const SUBCATEGORY_PALETTE = [
  '#38bdf8',
  '#10b981',
  '#f59e0b',
  '#fb7185',
  '#8b5cf6',
  '#64748b',
  '#f97316',
  '#06b6d4',
] as const;

export const DEFAULT_SUBCATEGORY_COLOR = SUBCATEGORY_PALETTE[0];

/** Stored hex from API, or deterministic fallback from id for legacy rows without color. */
export function resolveSubcategoryColor(subcategoryId: number, stored: string | null | undefined): string {
  if (stored && /^#[0-9A-Fa-f]{6}$/.test(stored)) {
    return stored.toLowerCase();
  }
  return SUBCATEGORY_PALETTE[subcategoryId % SUBCATEGORY_PALETTE.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
