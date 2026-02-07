export const hexToRgba = (hex: string, alpha: number) => {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) {
    return `rgba(0,0,0,${alpha})`;
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
