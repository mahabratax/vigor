'use client';
import React, { useEffect, useState } from 'react';
export default function Client() {
  const [View, setView] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    import('../src/app/BrowserApp')
      .then((m) => {
        if (live) setView(() => m.default);
      })
      .catch(() => {
        if (live) setError(true);
      });
    return () => {
      live = false;
    };
  }, []);
  return View ? (
    <View />
  ) : (
    <main className="storage-gate">
      <h1>Vigor</h1>
      <p>{error ? 'Could not load the application. Reload to try again.' : 'Opening workspace…'}</p>
      {error && <button onClick={() => window.location.reload()}>Reload</button>}
    </main>
  );
}
