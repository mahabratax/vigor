/** Viewport coordinates only: fixed overlays must never use document offsets. */
export interface GuideRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type GuideSide = 'top' | 'bottom' | 'left' | 'right' | 'sheet' | 'center';
export interface GuidePlacement {
  viewport: GuideRect;
  panel: GuideRect;
  spotlight: GuideRect | null;
  side: GuideSide;
  arrow: number;
  maxHeight: number;
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));
const right = (r: GuideRect) => r.x + r.width;
const bottom = (r: GuideRect) => r.y + r.height;
export function intersectRect(a: GuideRect, b: GuideRect): GuideRect | null {
  const x = Math.max(a.x, b.x),
    y = Math.max(a.y, b.y);
  const width = Math.min(right(a), right(b)) - x;
  const height = Math.min(bottom(a), bottom(b)) - y;
  return width > 1 && height > 1 ? { x, y, width, height } : null;
}
export function placeGuide(
  target: GuideRect | null,
  viewport: GuideRect,
  measuredHeight = 340,
): GuidePlacement {
  const margin = 12,
    gap = 14;
  const safe = {
    x: viewport.x + margin,
    y: viewport.y + margin,
    width: Math.max(1, viewport.width - margin * 2),
    height: Math.max(1, viewport.height - margin * 2),
  };
  const width = Math.min(376, safe.width);
  // Content scrolls independently; controls stay available on short screens.
  const maxHeight = Math.min(safe.height, Math.max(220, viewport.height * 0.58));
  const height = Math.min(Math.max(1, measuredHeight), maxHeight);
  const hole =
    target &&
    intersectRect(
      { x: target.x - 6, y: target.y - 6, width: target.width + 12, height: target.height + 12 },
      viewport,
    );
  let spotlight = hole;
  let side: GuideSide = 'center';
  let x = safe.x + (safe.width - width) / 2,
    y = safe.y + (safe.height - height) / 2;
  if (hole) {
    const alignedX = clamp(hole.x + hole.width / 2 - width / 2, safe.x, right(safe) - width);
    const alignedY = clamp(hole.y + hole.height / 2 - height / 2, safe.y, bottom(safe) - height);
    if (bottom(hole) + gap + height <= bottom(safe)) {
      side = 'bottom';
      x = alignedX;
      y = bottom(hole) + gap;
    } else if (viewport.width >= 768 && right(hole) + gap + width <= right(safe)) {
      side = 'right';
      x = right(hole) + gap;
      y = alignedY;
    } else if (viewport.width >= 768 && hole.x - gap - width >= safe.x) {
      side = 'left';
      x = hole.x - gap - width;
      y = alignedY;
    } else if (hole.y - gap - height >= safe.y) {
      side = 'top';
      x = alignedX;
      y = hole.y - gap - height;
    } else {
      // Large sections can extend beyond the viewport. Keep the upper portion clear
      // and put the coach below it, instead of drawing a ring through the tooltip.
      side = 'sheet';
      x = alignedX;
      y = bottom(safe) - height;
      spotlight = intersectRect(hole, {
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: Math.max(0, y - gap - viewport.y),
      });
    }
  }
  const arrow = hole
    ? side === 'left' || side === 'right'
      ? clamp(hole.y + hole.height / 2 - y, 20, height - 20)
      : clamp(hole.x + hole.width / 2 - x, 20, width - 20)
    : 0;
  return { viewport, panel: { x, y, width, height }, spotlight, side, arrow, maxHeight };
}
/** Blur panes leave the real target clear, without cloning or lifting app content. */
export function backdropRects(viewport: GuideRect, hole: GuideRect | null): GuideRect[] {
  if (!hole) return [viewport];
  return [
    { x: viewport.x, y: viewport.y, width: viewport.width, height: hole.y - viewport.y },
    {
      x: viewport.x,
      y: bottom(hole),
      width: viewport.width,
      height: bottom(viewport) - bottom(hole),
    },
    { x: viewport.x, y: hole.y, width: hole.x - viewport.x, height: hole.height },
    { x: right(hole), y: hole.y, width: right(viewport) - right(hole), height: hole.height },
  ].filter((r) => r.width > 0 && r.height > 0);
}
