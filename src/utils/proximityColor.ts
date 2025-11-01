/**
 * Calculate color based on cursor proximity to element
 * @param mouseX - Mouse X position
 * @param mouseY - Mouse Y position
 * @param elementRect - Element bounding rectangle
 * @param maxDistance - Maximum distance for full effect (default 150px)
 * @returns RGB color string
 */
export function getProximityColor(
  mouseX: number,
  mouseY: number,
  elementRect: DOMRect,
  maxDistance: number = 150
): string {
  // Calculate element center
  const centerX = elementRect.left + elementRect.width / 2;
  const centerY = elementRect.top + elementRect.height / 2;

  // Calculate distance from mouse to element center
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate proximity (0 = far, 1 = close)
  const proximity = Math.max(0, 1 - distance / maxDistance);

  // Blue color: #2563eb (rgb(37, 99, 235))
  // Orange color: #f97316 (rgb(249, 115, 22))
  const blueR = 37;
  const blueG = 99;
  const blueB = 235;

  const orangeR = 249;
  const orangeG = 115;
  const orangeB = 22;

  // Interpolate between blue and orange based on proximity
  const r = Math.round(blueR + (orangeR - blueR) * proximity);
  const g = Math.round(blueG + (orangeG - blueG) * proximity);
  const b = Math.round(blueB + (orangeB - blueB) * proximity);

  return `rgb(${r}, ${g}, ${b})`;
}
