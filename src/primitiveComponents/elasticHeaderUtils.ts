export function getPullLimit(headerHeight: number): number {
  'worklet';
  const limit = Math.max(0, Math.min(96, headerHeight * 0.35));

  return Number.isFinite(limit) ? limit : 0;
}

export function resistHeaderPull(distance: number, headerHeight: number): number {
  'worklet';
  const limit = getPullLimit(headerHeight);

  return limit > 0 && !Number.isNaN(distance)
    ? limit * (1 - Math.exp(-Math.max(0, distance) / (2 * limit)))
    : 0;
}

export function recoverPullDistance(displacement: number, headerHeight: number): number {
  'worklet';
  const limit = getPullLimit(headerHeight);

  return limit > 0 && !Number.isNaN(displacement)
    ? -2 * limit * Math.log(1 - Math.min(Math.max(0, displacement), limit * 0.999) / limit)
    : 0;
}

export function readBooleanProp(value: unknown, fallback: boolean): boolean {
  'worklet';
  if (typeof value === 'boolean') {
    return value;
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return typeof value.value === 'boolean' ? value.value : fallback;
  }

  return fallback;
}

export function readInsetTop(value: unknown): number {
  'worklet';
  const resolved = value && typeof value === 'object' && 'value' in value ? value.value : value;

  return typeof resolved === 'number' && Number.isFinite(resolved) ? Math.max(0, resolved) : 0;
}
