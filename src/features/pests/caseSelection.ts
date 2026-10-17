import type { DomainState } from '../../domain/types';
import { matchesSearch } from '../../i18n/display';

/** Keep the list, inspector, and header action on the same case. */
export function caseSelection(s: DomainState, query: URLSearchParams) {
  const status = query.get('status') ?? 'all',
    zone = query.get('zone') ?? 'all',
    search = query.get('search') ?? '',
    requested = query.get('case');
  const cases = s.cases.filter(
    (c) =>
      (status === 'all' || c.status === status) &&
      (zone === 'all' || c.zoneId === zone) &&
      matchesSearch(search, c.id, c.title, c.zoneId),
  );
  const selected = requested ? cases.find((c) => c.id === requested) : cases[0];
  return {
    cases,
    selected,
    requested,
    hidden: !!requested && !selected && s.cases.some((c) => c.id === requested),
  };
}
