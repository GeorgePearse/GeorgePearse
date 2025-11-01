// Generate a consistent color for a tag based on its name
export function getTagColor(tag: string): { bg: string; text: string } {
  // Predefined color palette with darker, subtle colors
  const colors = [
    { bg: '#1e3a8a', text: '#bfdbfe' }, // Dark blue
    { bg: '#831843', text: '#fbcfe8' }, // Dark pink
    { bg: '#14532d', text: '#bbf7d0' }, // Dark green
    { bg: '#713f12', text: '#fef08a' }, // Dark yellow
    { bg: '#581c87', text: '#e9d5ff' }, // Dark purple
    { bg: '#9a3412', text: '#fed7aa' }, // Dark orange
    { bg: '#312e81', text: '#c7d2fe' }, // Dark indigo
    { bg: '#134e4a', text: '#99f6e4' }, // Dark teal
    { bg: '#881337', text: '#fecdd3' }, // Dark rose
    { bg: '#78350f', text: '#fde68a' }, // Dark amber
    { bg: '#4c1d95', text: '#ddd6fe' }, // Dark violet
    { bg: '#064e3b', text: '#a7f3d0' }, // Dark emerald
  ];

  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value and modulo to get consistent index
  const index = Math.abs(hash) % colors.length;

  return colors[index];
}
