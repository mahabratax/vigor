import { navItems } from '../../app/pages';
const defaultReturn = '/#/ringkasan';
const destinations = new Set(navItems.map((item) => item.path));
const sessionKey = 'vigor:prototype-entry';
let inMemoryEntry: boolean | null = null;

/** Entry navigation is not an authentication or role check. */
export function workspaceReturn(value?: string | null): string {
  if (!value?.startsWith('/#/') || /[\\\u0000-\u001f\u007f]/.test(value)) return defaultReturn;
  const route = value.slice(2).split(/[?#]/)[0];
  return destinations.has(route) ? value : defaultReturn;
}
export function showLogin(pathname: string, hash: string) {
  return (
    pathname.replace(/\/+$/, '') === '/login' ||
    hash.split('?')[0] === '#/login' ||
    ((pathname === '/' || pathname === '') && (!hash || hash === '#' || hash === '#/'))
  );
}

/** Presentation state only. The private Site still owns real access control. */
export function hasPrototypeEntry() {
  if (inMemoryEntry !== null) return inMemoryEntry;
  try {
    return window.sessionStorage.getItem(sessionKey) === 'active';
  } catch {
    return false;
  }
}
function rememberEntry(active: boolean) {
  inMemoryEntry = active;
  try {
    if (active) window.sessionStorage.setItem(sessionKey, 'active');
    else window.sessionStorage.removeItem(sessionKey);
  } catch {
    /* A blocked session store must not prevent entering the prototype. */
  }
}
function navigateLocally(path: string) {
  window.history.replaceState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
export function enterPrototype(returnTo?: string | null) {
  rememberEntry(true);
  navigateLocally(workspaceReturn(returnTo));
}
export function exitPrototype() {
  rememberEntry(false);
  navigateLocally('/login');
}
export function needsEntry() {
  return showLogin(window.location.pathname, window.location.hash) || !hasPrototypeEntry();
}
export function entryReturn() {
  const explicit = new URLSearchParams(window.location.search).get('returnTo');
  return workspaceReturn(explicit ?? '/' + window.location.hash);
}
