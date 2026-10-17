import labels from './legacy-labels.json';
/** English presentation of known legacy labels. Stored enums and user records are
 * never rewritten. Unknown text, including user-entered names, passes through. */
export function displayLabel<T>(value: T): T {
  if (typeof value !== 'string') return value;
  return ((labels as Record<string, string>)[value.replace(/\s+/g, ' ').trim()] ?? value) as T;
}

/** Search both original saved text and its English display label. */
export function matchesSearch(query: string, ...values: unknown[]) {
  return values
    .flatMap((value) => [String(value ?? ''), String(displayLabel(value) ?? '')])
    .join(' ')
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}
