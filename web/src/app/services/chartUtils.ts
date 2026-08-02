/**
 * Utility to convert an array of numerical data points into SVG polyline points string.
 */
export function buildPolylinePoints(
  data: number[],
  viewWidth: number,
  viewHeight: number,
  padTop = 20,
  padBottom = 20
): string {
  if (!data || data.length < 2) {
    return `0,${viewHeight / 2} ${viewWidth},${viewHeight / 2}`;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const usableH = viewHeight - padTop - padBottom;

  return data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * viewWidth;
      const y = padTop + usableH - ((val - min) / range) * usableH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
