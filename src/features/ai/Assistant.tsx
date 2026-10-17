import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { PageContext } from '../../app/context';
import { value } from '../../app/context';
import { Button, Field, FormBox, Icon, Modal } from '../../components/ui';
import { assistantIssues } from '../../domain/assistant';
import type { AssistantAction, AssistantIssue } from '../../domain/assistant';
import { production } from '../../domain/production';
import type { CareTask } from '../../domain/productionTypes';
import { localDate } from '../../domain/format';
import { displayLabel } from '../../i18n/display';
import { can, type Permission } from '../access/permissions';
import { CropForms, type CropFormSpec } from '../cultivation/CropForms';
import {
  AssistantDialog,
  AssistantSeed,
  Decision,
  FollowUpList,
  QuestionComposer,
} from './AssistantSurface';
import { replyFor, suggestedQuestions, type AssistantTurn } from './conversation';
import { useGatewayStatus, useGemini } from './useGemini';
import { GeminiAnswer } from './GeminiAnswer';

const permissionFor: Partial<Record<AssistantAction['kind'], Permission>> = {
  inspection: 'inspection',
  release: 'crop_review',
  sale: 'finance',
  payment: 'finance',
};

/** Compact dashboard launcher. Record lookup and operational writes retain separate boundaries. */
export function Assistant({ ctx }: { ctx: PageContext }) {
  const issues = useMemo(() => assistantIssues(ctx.s), [ctx.s]);
  const [open, setOpen] = useState(false);
  const gateway = useGatewayStatus(open);
  const gemini = useGemini(ctx);
  const [mode, setMode] = useState<'records' | 'gemini'>('records');
  const [view, setView] = useState<'conversation' | 'follow-up'>('conversation');
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [currentId, setCurrentId] = useState<number>();
  const sequence = useRef(0),
    scroll = useRef<HTMLDivElement>(null);
  const [assignment, setAssignment] = useState<AssistantIssue>();
  const [form, setForm] = useState<CropFormSpec>();
  const [notice, setNotice] = useState('');
  const p = production(ctx.s),
    closed = p.stage === 'closed';
  const tasks = p.tasks.filter((t) => t.key.startsWith('assistant-v1:'));
  const unfinished = tasks.filter((t) => t.status === 'pending').length;
  const next = issues.find((i) => !i.resolved);
  const current = turns.find((t) => t.id === currentId) ?? turns.at(-1);
  const reply = current ? replyFor(ctx.s, current, issues) : undefined;
  const selected = reply?.matches[0];
  const allowed = (permission: Permission) =>
    ctx.can?.(permission) ?? can(ctx.role ?? 'Viewer', permission);
  const navigate = (url: string) => {
    setOpen(false);
    ctx.nav(url);
  };
  const close = () => {
    if (gemini.busy) gemini.cancel();
    setOpen(false);
  };
  function ask(question: string, issueId?: string) {
    if (!question.trim()) return;
    const questionMode = issueId ? 'records' : mode;
    const turn: AssistantTurn = {
      id: ++sequence.current,
      question: question.trim().slice(0, 300),
      issueId,
      mode: questionMode,
    };
    gemini.clear();
    setTurns((previous) => [...previous, turn].slice(-6));
    setCurrentId(turn.id);
    setView('conversation');
    setOpen(true);
    setNotice('');
    if (questionMode === 'gemini') void gemini.run(turn.question);
  }
  function perform(action: AssistantAction) {
    if (action.kind === 'navigate') navigate(action.url);
    else if (action.kind === 'inspection') {
      close();
      ctx.open('inspection', action.id);
    } else setForm({ kind: action.kind, id: action.id });
  }
  const handlers = {
    canAct: (action: AssistantAction) =>
      action.kind === 'navigate' || (!closed && allowed(permissionFor[action.kind]!)),
    canCare: !closed && allowed('cultivation'),
    perform,
    assign: setAssignment,
    complete: (id: string) => setForm({ kind: 'done' as const, id }),
    openTask: (task: CareTask) =>
      navigate(
        `/siklus?tab=care&task=${encodeURIComponent(task.id)}&zone=${encodeURIComponent(task.zoneId)}`,
      ),
  };
  useEffect(() => {
    scroll.current?.scrollTo?.({ top: 0, behavior: 'instant' });
  }, [current?.id, view]);
  return (
    <>
      <section className="va-launch" data-tour="assistant" aria-label="Vigor assistant">
        <button
          className="va-launch-identity"
          aria-label="Open Vigor assistant"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setView('conversation');
            setOpen(true);
          }}
        >
          <AssistantSeed />
          <span>
            <strong>Vigor assistant</strong>
            <small>{gateway.status?.configured ? 'Records & Gemini' : 'Local insights'}</small>
          </span>
        </button>
        <div className="va-launch-center">
          <QuestionComposer compact onSend={ask} disabled={gemini.busy} />
          {next ? (
            <button
              className="va-suggestion"
              onClick={() => ask('What should I check first?', next.id)}
            >
              <span className="va-suggestion-dot" />
              <span>{displayLabel(next.title)}</span>
              <Icon name="chevron" size={13} />
            </button>
          ) : (
            <span className="va-launch-hint">Plant health, watering, harvest & cash</span>
          )}
        </div>
        <button
          className="va-launch-tasks"
          aria-label="Open follow-up tasks"
          aria-haspopup="dialog"
          onClick={() => {
            setView('follow-up');
            setOpen(true);
          }}
        >
          <Icon name="history" size={18} />
          <span>{unfinished}</span>
        </button>
      </section>
      {open && (
        <AssistantDialog onClose={close}>
          <header className="va-panel-head">
            <AssistantSeed small />
            <div className="va-panel-name">
              <h2>Vigor assistant</h2>
              <span>{displayLabel(ctx.s.greenhouse.name)}</span>
            </div>
            <button
              className="va-icon-button"
              aria-label="New conversation"
              disabled={!turns.length}
              onClick={() => {
                setTurns([]);
                gemini.clear();
                setCurrentId(undefined);
                setNotice('');
                setView('conversation');
              }}
            >
              <Icon name="edit" size={18} />
            </button>
            <button className="va-icon-button" aria-label="Close assistant" onClick={close}>
              <Icon name="close" size={20} />
            </button>
          </header>
          <nav className="va-panel-nav" aria-label="Assistant views">
            <button aria-pressed={view === 'conversation'} onClick={() => setView('conversation')}>
              Conversation
            </button>
            <button aria-pressed={view === 'follow-up'} onClick={() => setView('follow-up')}>
              Follow-up <span>{tasks.length}</span>
            </button>
            {closed && <span className="va-read-only">Read-only cycle</span>}
          </nav>
          {view === 'conversation' && (
            <div className="va-mode" aria-label="Answer source">
              <button
                aria-pressed={mode === 'records'}
                disabled={gemini.busy}
                onClick={() => {
                  setMode('records');
                }}
              >
                Local records
              </button>
              <button
                aria-pressed={mode === 'gemini'}
                disabled={!gateway.status?.configured || gemini.busy}
                title={
                  gateway.status?.configured
                    ? 'Send selected record facts to Google Gemini'
                    : 'Configure Gemini on the Google Cloud deployment first'
                }
                onClick={() => setMode('gemini')}
              >
                Gemini
              </button>
              {!gateway.status?.configured && (
                <button className="va-mode-setup" onClick={() => navigate('/settings?tab=ai')}>
                  Set up AI
                </button>
              )}
            </div>
          )}
          <div className="va-panel-content" ref={scroll}>
            {notice && (
              <div className="va-notice" role="status">
                <Icon name="checkcircle" size={17} />
                <span>{notice}</span>
                <button
                  className="va-icon-button"
                  aria-label="Dismiss assistant message"
                  onClick={() => setNotice('')}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            )}
            {view === 'follow-up' ? (
              <FollowUpList tasks={tasks} issues={issues} handlers={handlers} />
            ) : (
              <>
                {!current ? (
                  <div className="va-welcome">
                    <AssistantSeed />
                    <h3>What should we check?</h3>
                    <p>
                      {mode === 'gemini'
                        ? 'Ask Gemini to explain priorities and their next steps.'
                        : 'Find the next action for your greenhouse.'}
                    </p>
                    <div className="va-prompts">
                      {suggestedQuestions.map((question, i) => (
                        <button key={question} onClick={() => ask(question)}>
                          <Icon name={(['leaf', 'drop', 'box'] as const)[i]} size={18} />
                          <span>{question}</span>
                          <Icon name="chevron" size={14} />
                        </button>
                      ))}
                    </div>
                    <p className="va-welcome-note">
                      Answers use the selected greenhouse’s saved records.
                    </p>
                  </div>
                ) : (
                  <>
                    {turns.length > 1 && (
                      <details className="va-history">
                        <summary>
                          Recent questions <span>{turns.length - 1}</span>
                        </summary>
                        <div>
                          {turns
                            .filter((t) => t.id !== current.id)
                            .map((t) => (
                              <button
                                key={t.id}
                                disabled={gemini.busy}
                                onClick={() => setCurrentId(t.id)}
                              >
                                {t.question}
                              </button>
                            ))}
                        </div>
                      </details>
                    )}
                    <div className="va-question">
                      <span className="sr-only">You asked: </span>
                      {current.question}
                    </div>
                    <div className="va-answer">
                      <div className="va-answer-identity">
                        <AssistantSeed small />
                        <span>Vigor</span>
                        <small>
                          {current.mode === 'gemini' ? 'Google Gemini' : 'From your records'}
                        </small>
                      </div>
                      {current.mode === 'gemini' ? (
                        <>
                          {gemini.busy ? (
                            <div className="va-model-status" role="status" aria-live="polite">
                              <p>Analyzing the selected greenhouse’s records…</p>
                              <Button small onClick={gemini.cancel}>
                                Cancel analysis
                              </Button>
                            </div>
                          ) : gemini.error ? (
                            <div className="va-model-status" role="alert">
                              <p>{gemini.error}</p>
                              <Button small onClick={() => void gemini.run(current.question)}>
                                Try analysis again
                              </Button>
                            </div>
                          ) : gemini.analysis?.question === current.question ? (
                            <GeminiAnswer
                              analysis={gemini.analysis}
                              stale={gemini.stale}
                              ctx={ctx}
                              handlers={handlers}
                              retry={() => void gemini.run(current.question)}
                            />
                          ) : (
                            <div className="va-model-status">
                              <p>Run this question against the latest records.</p>
                              <Button small onClick={() => void gemini.run(current.question)}>
                                Analyze current records
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="va-answer-intro" aria-live="polite">
                            {reply?.intro}
                          </p>
                          {selected && (
                            <Decision key={selected.id} issue={selected} handlers={handlers} />
                          )}
                          {reply?.followUp && (
                            <Button small tone="primary" onClick={() => setView('follow-up')}>
                              View follow-up tasks
                            </Button>
                          )}
                          {reply && !reply.matches.length && !reply.followUp && (
                            <div className="va-prompts small">
                              {suggestedQuestions.map((q) => (
                                <button key={q} onClick={() => ask(q)}>
                                  {q}
                                  <Icon name="chevron" size={14} />
                                </button>
                              ))}
                              <button onClick={() => navigate('/greenhouse')}>
                                Open greenhouse records
                                <Icon name="chevron" size={14} />
                              </button>
                            </div>
                          )}
                          {!!reply && reply.matches.length > 1 && (
                            <details className="va-more">
                              <summary>
                                {reply.matches.length - 1} more matching priorities
                                <Icon name="down" size={14} />
                              </summary>
                              <div>
                                {reply.matches.slice(1).map((i) => (
                                  <button
                                    key={i.id}
                                    onClick={() => ask(`Review ${displayLabel(i.title)}`, i.id)}
                                  >
                                    <span>{displayLabel(i.title)}</span>
                                    <Icon name="chevron" size={14} />
                                  </button>
                                ))}
                              </div>
                            </details>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <footer className="va-panel-footer">
            <QuestionComposer onSend={ask} disabled={gemini.busy} />
            <div className="va-provider-note">
              <span>
                {mode === 'gemini'
                  ? 'Sends selected facts & amounts to Google. No customer profiles.'
                  : gateway.status?.configured
                    ? 'Local lookup. Select Gemini for model analysis.'
                    : 'Local record lookup. Gemini not connected.'}
              </span>
              <button onClick={() => navigate('/settings?tab=ai')}>AI setup</button>
            </div>
          </footer>
        </AssistantDialog>
      )}
      {assignment && (
        <Modal
          title="Assign follow-up"
          description="Linked to this greenhouse, crop cycle and source finding."
          onClose={() => setAssignment(undefined)}
        >
          <FormBox
            onSubmit={async (f) => {
              const r = await ctx.act({
                type: 'assistant_task',
                greenhouseId: ctx.s.greenhouse.id,
                issueId: assignment.id,
                fingerprint: assignment.fingerprint,
                operator: value(f, 'operator'),
                dueOn: value(f, 'dueOn'),
              });
              if (r.ok) {
                setAssignment(undefined);
                setNotice(
                  `Follow-up ${r.id ?? ''} saved. Record the work, then verify the outcome.`,
                );
              }
              return r;
            }}
          >
            <div className="va-assignment-summary">
              <strong>{displayLabel(assignment.followUp?.title)}</strong>
              <p>{assignment.verification}</p>
            </div>
            <Field label="Assigned to">
              <input
                name="operator"
                defaultValue={ctx.actor ?? p.operator}
                required
                minLength={2}
                maxLength={120}
              />
            </Field>
            <Field label="Due date">
              <input
                name="dueOn"
                type="date"
                min={ctx.s.cycle.plantedOn}
                defaultValue={localDate(ctx.s.clock)}
                required
              />
            </Field>
            <div className="button-row">
              <Button onClick={() => setAssignment(undefined)}>Cancel</Button>
              <Button type="submit" tone="primary">
                Save follow-up task
              </Button>
            </div>
          </FormBox>
        </Modal>
      )}
      {form && <CropForms ctx={ctx} spec={form} onClose={() => setForm(undefined)} />}
    </>
  );
}
