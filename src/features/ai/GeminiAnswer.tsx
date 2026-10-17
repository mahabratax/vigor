import React from 'react';
import type { PageContext } from '../../app/context';
import { assistantIssues } from '../../domain/assistant';
import { Button } from '../../components/ui';
import { Decision, type DecisionHandlers } from './AssistantSurface';
import type { GeminiAnalysis } from './useGemini';

export function GeminiAnswer({
  analysis,
  ctx,
  handlers,
  stale,
  retry,
}: {
  analysis: GeminiAnalysis;
  ctx: PageContext;
  handlers: DecisionHandlers;
  stale: string;
  retry: () => void;
}) {
  const { response, snapshot } = analysis;
  const issues = assistantIssues({ ...ctx.s, clock: Math.floor(Date.now() / 1000) });
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigor-analysis-${response.requestId}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (stale)
    return (
      <div className="va-model-status" role="status">
        <p>{stale}</p>
        <Button small onClick={retry}>
          Analyze current records
        </Button>
      </div>
    );
  return (
    <div className="va-model-answer">
      <p className="va-answer-intro">{response.answer}</p>
      {response.priorities.map((p, index) => {
        const issue = issues.find((i) => i.id === p.findingId);
        const evidence = snapshot.findings.find((f) => f.id === p.findingId)?.evidence ?? [];
        if (!issue)
          return <p key={p.findingId}>This finding changed. Ask again using the latest records.</p>;
        const content = (
          <>
            <p>{p.why}</p>
            <Decision
              issue={issue}
              handlers={handlers}
              showReason={false}
              uncertainty={p.uncertainty}
              citedSources={p.evidenceIds.map((id) => evidence.find((e) => e.id === id)!.label)}
            />
          </>
        );
        return index === 0 ? (
          <div className="va-model-priority" key={p.findingId}>
            {content}
          </div>
        ) : (
          <details className="va-model-priority" key={p.findingId}>
            <summary>{issue.title}</summary>
            {content}
          </details>
        );
      })}
      {response.followUpQuestion && (
        <p className="va-model-question">{response.followUpQuestion}</p>
      )}
      <details className="va-model-receipt">
        <summary>Analysis details</summary>
        <dl>
          <div>
            <dt>Model</dt>
            <dd>{response.model}</dd>
          </div>
          <div>
            <dt>Response time</dt>
            <dd>{(response.latencyMs / 1000).toFixed(1)} s</dd>
          </div>
          <div>
            <dt>Total tokens</dt>
            <dd>{response.usage.totalTokens ?? 'Not returned'}</dd>
          </div>
          <div>
            <dt>Input</dt>
            <dd>
              {snapshot.findings.length} findings, workspace revision {snapshot.workspaceRevision}
            </dd>
          </div>
        </dl>
        <p>
          Generated from saved records. Review the evidence before acting. This does not verify
          field conditions or measured savings.
        </p>
        <Button small permission="export" onClick={download}>
          Export analysis
        </Button>
      </details>
    </div>
  );
}
