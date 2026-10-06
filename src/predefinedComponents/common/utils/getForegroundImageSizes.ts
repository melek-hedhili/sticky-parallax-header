export function getForegroundImageSizes(
  windowWidth: number,
  parallaxHeight: number,
  collapsedWidthPercent: number
) {
  const responsiveStartSize = windowWidth * 0.18;
  const startSize = parallaxHeight <= 320 ? Math.min(responsiveStartSize, 96) : responsiveStartSize;

  return { startSize, endSize: startSize * (collapsedWidthPercent / 18) };
}
