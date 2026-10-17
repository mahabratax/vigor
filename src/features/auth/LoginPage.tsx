import React, { useState } from 'react';
import { Icon } from '../../components/ui';
import { useTheme } from '../../app/theme';
import type { Theme } from '../../store/workspace';
import logo from '../../../public/assets/vigor-forest.webp?inline';
import greenhouse from '../../../public/illustrations/greenhouse-large.webp?inline';
import { enterPrototype } from './entry';

export default function LoginPage({ returnTo }: { returnTo?: string | null }) {
  const [theme, setTheme] = useState<Theme>('system');
  const resolvedTheme = useTheme(theme);
  const [imageFailed, setImageFailed] = useState(false);
  const [accessHelp, setAccessHelp] = useState(false);
  return (
    <div className="vigor-entry">
      <a
        className="skip-link"
        href="#sign-in"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('sign-in')?.focus();
        }}
      >
        Skip to sign in
      </a>
      <header className="entry-header">
        <a className="entry-brand" href="/login" aria-label="Vigor sign in">
          <img src={logo} alt="Vigor" width={142} height={60} />
        </a>
        <span className="entry-workspace-label">Greenhouse workspace</span>
        <button
          className="entry-theme"
          type="button"
          aria-label={resolvedTheme === 'dark' ? 'Use light theme' : 'Use dark theme'}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          <Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={19} />
        </button>
      </header>
      <main className="entry-main">
        <section className="entry-scene" aria-label="Growing with Vigor">
          <div className="entry-scene-copy">
            <h2>
              Good growing starts
              <br />
              with a clearer view.
            </h2>
            <p>From the first observation to the next harvest.</p>
          </div>
          {!imageFailed && (
            <img
              className="entry-greenhouse"
              src={greenhouse}
              alt="Miniature greenhouse with crop beds, an irrigation station, and two farm operators caring for plants."
              width={1280}
              height={853}
              fetchPriority="high"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}
        </section>
        <section className="entry-access" id="sign-in" tabIndex={-1} aria-labelledby="entry-title">
          <div className="entry-access-inner">
            <h1 id="entry-title">Welcome to Vigor</h1>
            <p className="entry-introduction">
              Your greenhouse, from daily care to harvest and business results.
            </p>
            <button
              type="button"
              className="entry-primary"
              onClick={() => enterPrototype(returnTo)}
            >
              <Icon name="greenhouse" size={19} />
              Enter workspace
            </button>
            <p className="entry-auth-note">Prototype access. No email or password needed.</p>
            <div className="entry-access-help">
              <button
                type="button"
                className="entry-help-trigger"
                aria-expanded={accessHelp}
                aria-controls="entry-help"
                onClick={() => setAccessHelp(!accessHelp)}
              >
                How does access work?
                <Icon name="down" size={15} />
              </button>
              {accessHelp && (
                <p id="entry-help" role="status">
                  This opens your existing browser workspace. Logout returns here and keeps your
                  records. This local session does not verify your identity or change your farm
                  role.
                </p>
              )}
            </div>
            <div className="entry-scope">
              <Icon name="leaf" size={18} />
              <p>Monitoring, field work, and costs stay connected to the same greenhouse.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="entry-footer">
        <span>Built for the growing day.</span>
        <span>Records stay in this browser.</span>
      </footer>
    </div>
  );
}
