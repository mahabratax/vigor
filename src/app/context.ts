import type { Action, ActionResult } from '../domain/actions';
import type { Permission, Role } from '../features/access/permissions';
import type { DomainState } from '../domain/types';
export interface ModalSpec {
  kind: string;
  id?: string;
  extra?: string;
}
export interface PageContext {
  s: DomainState;
  role?: Role;
  actor?: string;
  can?: (permission: Permission) => boolean;
  query: URLSearchParams;
  mobile: boolean;
  nav: (url: string) => void;
  open: (kind: string, id?: string, extra?: string) => void;
  act: (a: Action) => Promise<ActionResult>;
}
export function updateQuery(
  ctx: PageContext,
  route: string,
  values: Record<string, string | undefined>,
) {
  const q = new URLSearchParams(ctx.query);
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === '') q.delete(k);
    else q.set(k, v);
  }
  ctx.nav(route + (q.size ? '?' + q.toString() : ''));
}
export const value = (f: FormData, key: string) => String(f.get(key) ?? '');
export const numeric = (f: FormData, key: string) => Number(value(f, key));
export const checked = (f: FormData, key: string) => f.get(key) === 'on';
