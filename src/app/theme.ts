import { useEffect, useState } from 'react';
import type { Theme } from '../store/workspace';
export function applyTheme(preference: Theme) {
  const dark =
    preference === 'dark' ||
    (preference === 'system' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#14261f' : '#f3f7f4');
  return dark ? 'dark' : 'light';
}
export function useTheme(preference: Theme) {
  const [resolved, setResolved] = useState('light');
  useEffect(() => {
    setResolved(applyTheme(preference));
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setResolved(applyTheme(preference));
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, [preference]);
  return resolved;
}
