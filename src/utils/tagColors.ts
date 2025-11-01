// Generate a consistent color for a tag based on its name
export function getTagColor(tag: string): { bg: string; text: string } {
  // Predefined color palette with good contrast
  const colors = [
    { bg: '#dbeafe', text: '#1e40af' }, // Blue
    { bg: '#fce7f3', text: '#9f1239' }, // Pink
    { bg: '#dcfce7', text: '#15803d' }, // Green
    { bg: '#fef3c7', text: '#a16207' }, // Yellow
    { bg: '#f3e8ff', text: '#6b21a8' }, // Purple
    { bg: '#ffedd5', text: '#c2410c' }, // Orange
    { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
    { bg: '#ccfbf1', text: '#115e59' }, // Teal
    { bg: '#ffe4e6', text: '#be123c' }, // Rose
    { bg: '#fef9c3', text: '#854d0e' }, // Amber
    { bg: '#ddd6fe', text: '#5b21b6' }, // Violet
    { bg: '#d1fae5', text: '#065f46' }, // Emerald
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
