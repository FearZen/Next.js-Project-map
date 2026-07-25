// Helper to generate deterministic HSL color for any Category Sheet Name

export function getCategoryColorHex(categoryName: string): string {
  const palette: Record<string, string> = {
    'cafe & restoran': '#2563eb', // Royal Blue
    'cafe': '#2563eb',
    'restoran': '#2563eb',
    'warung': '#f59e0b', // Amber Gold
    'kesehatan': '#e11d48', // Crimson Rose
    'apotek': '#e11d48',
    'toko & minimarket': '#8b5cf6', // Vibrant Violet
    'toko': '#8b5cf6',
    'minimarket': '#8b5cf6',
    'pemerintahan & sekolah': '#10b981', // Emerald Green
    'sekolah': '#10b981',
    'hotel': '#06b6d4', // Cyan
    'sebaran bank': '#ea580c', // Orange
    'bank': '#ea580c',
  };

  const key = (categoryName || '').trim().toLowerCase();
  if (palette[key]) return palette[key];

  // Deterministic HSL color hash for any dynamic sheet name
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 48%)`;
}
