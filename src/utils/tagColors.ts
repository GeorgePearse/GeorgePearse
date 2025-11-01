// Generate a consistent color for a tag based on its name
export function getTagColor(tag: string): { bg: string; text: string } {
  // Predefined color palette with very dark, subtle colors
  const colors = [
    { bg: '#172554', text: '#bfdbfe' }, // Very dark blue
    { bg: '#500724', text: '#fbcfe8' }, // Very dark pink
    { bg: '#052e16', text: '#bbf7d0' }, // Very dark green
    { bg: '#422006', text: '#fef08a' }, // Very dark yellow
    { bg: '#3b0764', text: '#e9d5ff' }, // Very dark purple
    { bg: '#7c2d12', text: '#fed7aa' }, // Very dark orange
    { bg: '#1e1b4b', text: '#c7d2fe' }, // Very dark indigo
    { bg: '#042f2e', text: '#99f6e4' }, // Very dark teal
    { bg: '#4c0519', text: '#fecdd3' }, // Very dark rose
    { bg: '#451a03', text: '#fde68a' }, // Very dark amber
    { bg: '#2e1065', text: '#ddd6fe' }, // Very dark violet
    { bg: '#022c22', text: '#a7f3d0' }, // Very dark emerald
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
