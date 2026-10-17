import { useEffect, useRef, useState } from 'react';
import type { PageContext } from '../../app/context';
import { getWorkspaceRevision } from '../../store/persistence';
import { createBriefSnapshot } from './briefInput';
import { validateBrief, type BriefSnapshot, type BriefResponse } from './briefContract';
import { z } from 'zod';

export interface GatewayStatus {
  configured: boolean;
  model: string | null;
  hosting: string;
  message: string;
}
export function useGatewayStatus(active = true) {
  const [status, setStatus] = useState<GatewayStatus>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    let live = true;
    (async () => {
      try {
        const r = await fetch('/api/ai/status', {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
          cache: 'no-store',
        });
        if (!r.ok) throw new Error();
        const data = z
          .object({
            configured: z.boolean(),
            model: z.string().nullable(),
            hosting: z.string(),
            message: z.string(),
          })
          .parse(await r.json());
        if (live) setStatus(data);
      } catch {
        if (live)
          setStatus({
            configured: false,
            model: null,
            hosting: 'unknown',
            message: 'The AI gateway could not be reached. Local record lookup is still available.',
          });
      }
    })();
    return () => {
      live = false;
      controller.abort();
    };
  }, [active, attempt]);
  return { status, refresh: () => setAttempt((n) => n + 1) };
}
export interface GeminiAnalysis {
  question: string;
  snapshot: BriefSnapshot;
  response: BriefResponse;
}
export function useGemini(ctx: PageContext) {
  const current = useRef(ctx);
  current.current = ctx;
  const request = useRef<AbortController | undefined>(undefined);
  const [analysis, setAnalysis] = useState<GeminiAnalysis>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  function clear() {
    request.current?.abort();
    request.current = undefined;
    setAnalysis(undefined);
    setError('');
    setBusy(false);
  }
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (!analysis) return;
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 10000);
    return () => clearInterval(timer);
  }, [analysis]);
  const scope = () => ({
    greenhouseId: current.current.s.greenhouse.id,
    cycleId: current.current.s.cycle.id,
    revision: getWorkspaceRevision(),
    now: Math.floor(Date.now() / 1000),
  });
  async function run(question: string) {
    clear();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    try {
      const snapshot = await createBriefSnapshot(current.current.s, getWorkspaceRevision());
      if (controller.signal.aborted) return;
      const response = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]),
        body: JSON.stringify({ question, snapshot }),
      });
      const data = await response
        .json()
        .catch(() => ({ error: 'The AI service returned an unreadable response.' }));
      if (!response.ok) {
        const error = z.object({ error: z.string().max(1000) }).safeParse(data);
        throw new Error(error.success ? error.data.error : 'Gemini analysis is unavailable.');
      }
      const verified = validateBrief(data, snapshot, scope());
      if (!controller.signal.aborted) {
        setNow(Math.floor(Date.now() / 1000));
        setAnalysis({ question, snapshot, response: verified });
      }
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof z.ZodError
            ? 'The AI response could not be verified. Ask again using the latest records.'
            : e instanceof Error && e.name === 'TimeoutError'
              ? 'Gemini took too long to respond. Try again or use local records.'
              : e instanceof TypeError
                ? 'Could not reach the AI service. Check your connection and try again.'
                : e instanceof Error
                  ? e.message
                  : 'Analysis failed. Try again.',
        );
    } finally {
      if (request.current === controller) {
        request.current = undefined;
        setBusy(false);
      }
    }
  }
  let stale = '';
  if (analysis)
    try {
      validateBrief(analysis.response, analysis.snapshot, {
        ...scope(),
        now: Math.max(now, scope().now),
      });
    } catch (e) {
      stale = e instanceof Error ? e.message : 'Ask again using the latest records.';
    }
  return {
    analysis,
    busy,
    error,
    stale,
    run,
    clear,
    cancel: () => {
      clear();
      setError('Analysis cancelled. No records were changed.');
    },
  };
}
