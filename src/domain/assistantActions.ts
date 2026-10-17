import type { DomainState } from './types';
import { assistantIssues, assistantTaskKey } from './assistant';
import { applyProduction, production } from './production';

export type AssistantTaskAction = {
  type: 'assistant_task';
  greenhouseId: string;
  issueId: string;
  fingerprint: string;
  operator: string;
  dueOn: string;
};

export function applyAssistantTask(s: DomainState, a: AssistantTaskAction) {
  if (a.greenhouseId !== s.greenhouse.id)
    throw new Error('The greenhouse changed. Reopen the recommendation.');
  const p = production(s);
  const key = assistantTaskKey(a.issueId);
  const existing = p.tasks.find((t) => t.key === key);
  if (existing)
    return {
      ok: true,
      id: existing.id,
      message: 'Follow-up already assigned. Open the existing task.',
    };
  const issue = assistantIssues(s).find((i) => i.id === a.issueId);
  if (!issue || !issue.followUp || issue.resolved || issue.fingerprint !== a.fingerprint)
    throw new Error(
      'The evidence changed or no longer supports this task. Close this form and review the latest priority.',
    );
  return applyProduction(s, {
    type: 'crop_task',
    task: {
      ...issue.followUp,
      operator: a.operator,
      dueOn: a.dueOn,
      key,
    },
  });
}
