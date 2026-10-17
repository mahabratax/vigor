import React, { useEffect, useId, useRef } from 'react';
import { Button, Icon } from '../../components/ui';
import type { AssistantAction, AssistantIssue } from '../../domain/assistant';
import type { CareTask } from '../../domain/productionTypes';
import { displayLabel } from '../../i18n/display';

export function AssistantSeed({ small = false }: { small?: boolean }) {
  return (
    <span className={`va-seed ${small ? 'small' : ''}`} aria-hidden="true">
      <span className="va-seed-ring" />
      <Icon name="leaf" size={small ? 17 : 26} />
    </span>
  );
}

export function AssistantDialog({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current,
      previous = document.activeElement as HTMLElement | null;
    const overflow = document.documentElement.style.overflow;
    dialog?.showModal();
    if (window.innerWidth > 700)
      dialog
        ?.querySelector<HTMLInputElement>('.va-panel-footer input')
        ?.focus({ preventScroll: true });
    document.documentElement.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.documentElement.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="va-dialog"
      aria-label="Vigor assistant"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="va-dialog-inner">{children}</div>
    </dialog>
  );
}

export function QuestionComposer({
  onSend,
  compact = false,
  disabled = false,
}: {
  onSend: (question: string) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <form
      className={`va-composer ${compact ? 'compact' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('question') as HTMLInputElement;
        const question = input.value.trim();
        if (question) {
          onSend(question);
          input.value = '';
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
        Ask Vigor
      </label>
      <input
        id={id}
        name="question"
        aria-label="Ask Vigor"
        placeholder={
          compact ? 'Ask about your greenhouse…' : 'Ask about plants, watering or sales…'
        }
        maxLength={300}
        autoComplete="off"
        required
        disabled={disabled}
      />
      <button type="submit" className="va-send" aria-label="Send question" disabled={disabled}>
        <Icon name="arrow" size={18} />
      </button>
    </form>
  );
}

export interface DecisionHandlers {
  canAct: (action: AssistantAction) => boolean;
  canCare: boolean;
  perform: (action: AssistantAction) => void;
  assign: (issue: AssistantIssue) => void;
  complete: (id: string) => void;
  openTask: (task: CareTask) => void;
}
export function Decision({
  issue,
  handlers,
  showReason = true,
  uncertainty,
  citedSources,
}: {
  issue: AssistantIssue;
  handlers: DecisionHandlers;
  showReason?: boolean;
  uncertainty?: string;
  citedSources?: string[];
}) {
  const status = issue.resolved
    ? 'Source reviewed'
    : issue.task?.status === 'done'
      ? 'Outcome review needed'
      : issue.task
        ? 'Follow-up assigned'
        : 'Next action';
  return (
    <div className="va-decision">
      <div className="va-decision-meta">
        <span>{status}</span>
        <span>{displayLabel(issue.impact.value)}</span>
      </div>
      <h3>{displayLabel(issue.title)}</h3>
      {showReason && <p>{displayLabel(issue.reason)}</p>}
      <div className="va-actions">
        {issue.actions.slice(0, 1).map((action) => (
          <Button
            key={action.label}
            small
            tone="primary"
            disabled={!handlers.canAct(action)}
            onClick={() => handlers.perform(action)}
          >
            {action.label}
          </Button>
        ))}
        {issue.task?.status === 'pending' ? (
          <Button
            small
            disabled={!handlers.canCare}
            onClick={() => handlers.complete(issue.task!.id)}
          >
            Record care results
          </Button>
        ) : (
          issue.followUp &&
          !issue.task && (
            <Button small disabled={!handlers.canCare} onClick={() => handlers.assign(issue)}>
              Assign follow-up
            </Button>
          )
        )}
      </div>
      {issue.task && (
        <button className="va-task-link" onClick={() => handlers.openTask(issue.task!)}>
          <Icon name={issue.task.status === 'done' ? 'eye' : 'checkcircle'} size={14} />
          <span>
            {issue.task.id} / {displayLabel(issue.task.operator)} / {issue.task.dueOn}
          </span>
          <Icon name="chevron" size={13} />
        </button>
      )}
      <details className="va-disclosure">
        <summary>
          <Icon name="layers" size={14} />
          <span>Sources & next steps</span>
          <small>{issue.evidence.length}</small>
          <Icon name="down" size={13} />
        </summary>
        <div className="va-disclosure-body">
          {uncertainty && (
            <p>
              <strong>What remains uncertain.</strong> {uncertainty}
            </p>
          )}
          {citedSources?.length ? (
            <p className="micro muted">Cited by Gemini: {citedSources.join(', ')}.</p>
          ) : null}
          <p className="va-impact-note">
            <strong>{displayLabel(issue.impact.label)}.</strong> {displayLabel(issue.impact.detail)}
          </p>
          <div className="va-sources">
            {issue.evidence.map((e, index) => (
              <button
                key={index}
                onClick={() => handlers.perform({ kind: 'navigate', label: e.label, url: e.url })}
              >
                <span>
                  <small>{displayLabel(e.label)}</small>
                  {displayLabel(e.value)}
                </span>
                <Icon name="external" size={13} />
              </button>
            ))}
          </div>
          <ol className="va-workflow">
            {issue.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="va-verify">
            <Icon name="eye" size={16} />
            <p>
              <strong>Verify the result</strong>
              {issue.verification}
            </p>
          </div>
          <div className="va-actions">
            {issue.actions.slice(1).map((a) => (
              <Button
                key={a.label}
                small
                disabled={!handlers.canAct(a)}
                onClick={() => handlers.perform(a)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

export function FollowUpList({
  tasks,
  issues,
  handlers,
}: {
  tasks: CareTask[];
  issues: AssistantIssue[];
  handlers: DecisionHandlers;
}) {
  return (
    <div className="va-follow-ups">
      <h3>Keep the loop closed.</h3>
      <p>Record the work. Check the source before marking the problem resolved.</p>
      {tasks.length ? (
        [...tasks]
          .sort(
            (a, b) =>
              Number(a.status === 'done') - Number(b.status === 'done') ||
              a.dueOn.localeCompare(b.dueOn),
          )
          .map((task) => {
            const issue = issues.find((i) => task.key === `assistant-v1:${i.id}`);
            const source = issue?.actions.find((a) => a.kind === 'navigate');
            return (
              <details className="va-task" key={task.id}>
                <summary>
                  <Icon name={task.status === 'pending' ? 'clock' : 'checkcircle'} size={18} />
                  <span>
                    <strong>{displayLabel(task.title)}</strong>
                    <small>
                      {displayLabel(task.operator)} / {task.dueOn}
                    </small>
                  </span>
                  <Icon name="down" size={14} />
                </summary>
                <div className="va-task-body">
                  <span className="va-task-status">
                    {task.status === 'pending'
                      ? 'Assigned'
                      : issue?.resolved
                        ? 'Result verified in records'
                        : 'Work recorded; verify outcome'}
                  </span>
                  {task.notes && <blockquote>{displayLabel(task.notes)}</blockquote>}
                  <p>
                    {issue?.verification ??
                      'Source conditions changed. Review the original field records before concluding that the issue is resolved.'}
                  </p>
                  <div className="va-actions">
                    {task.status === 'pending' && (
                      <Button
                        small
                        tone="primary"
                        disabled={!handlers.canCare}
                        onClick={() => handlers.complete(task.id)}
                      >
                        Record care results
                      </Button>
                    )}
                    {source && (
                      <Button small onClick={() => handlers.perform(source)}>
                        Review source evidence
                      </Button>
                    )}
                    <Button small tone="ghost" onClick={() => handlers.openTask(task)}>
                      Open care record
                    </Button>
                  </div>
                </div>
              </details>
            );
          })
      ) : (
        <div className="va-empty">
          <Icon name="workflow" size={24} />
          <strong>No follow-up assigned yet</strong>
          <p>Ask what needs attention, then assign a care task from the recommendation.</p>
        </div>
      )}
    </div>
  );
}
