import React from 'react';
import { caseSelection } from '../features/pests/caseSelection';
import { Button } from '../components/ui';
import type { PageContext } from './context';
export function PageActions({ path, ctx }: { path: string; ctx: PageContext }) {
  const tab = ctx.query.get('tab');
  if (path === '/otomasi' && tab === 'builder') return null;
  if (path === '/perangkat' && tab && tab !== 'inventory') return null;
  if (path === '/biaya' && tab && !['summary', 'expenses'].includes(tab)) return null;
  const caseId =
    path === '/hama'
      ? caseSelection(ctx.s, ctx.query).selected?.id
      : ctx.query.has('case')
        ? ctx.s.cases.find((c) => c.id === ctx.query.get('case'))?.id
        : ctx.s.cases.find((c) => c.status !== 'closed')?.id;
  if (path === '/greenhouse') return null;
  if (path === '/siklus' && tab !== 'sales') return null;
  if (path === '/siklus')
    return (
      <Button icon="wallet" onClick={() => ctx.nav('/biaya?tab=profit')}>
        Review business results
      </Button>
    );
  if (path === '/settings' || path === '/akses') return null;
  if (path === '/hama' && ctx.query.get('tab') === 'detection')
    return (
      <Button
        permission="inspection"
        icon="refresh"
        onClick={async () => await ctx.act({ type: 'evaluate_detection' })}
      >
        Evaluate observations
      </Button>
    );
  return path === '/otomasi' ? (
    <Button
      permission="automation"
      icon="plus"
      tone="primary"
      onClick={() => ctx.nav('/otomasi?tab=builder')}
    >
      Create routine
    </Button>
  ) : path === '/biaya' ? (
    <>
      {(!tab || tab === 'summary') && (
        <Button permission="finance" icon="box" onClick={() => ctx.open('planner')}>
          Device plan
        </Button>
      )}
      <Button permission="finance" icon="plus" tone="primary" onClick={() => ctx.open('expense')}>
        Record expense
      </Button>
    </>
  ) : path === '/perangkat' ? (
    <Button
      permission="devices"
      icon="plus"
      tone="primary"
      onClick={() => ctx.open('device-create')}
    >
      Add device
    </Button>
  ) : path === '/hama' ? (
    <Button
      permission="inspection"
      icon="plus"
      tone="primary"
      disabled={!caseId}
      title={!caseId ? 'Select an available case to record its inspection.' : undefined}
      onClick={() => ctx.open('inspection', caseId)}
    >
      Record inspection
    </Button>
  ) : path === '/pengendalian' ? (
    <Button
      permission="control"
      icon="plus"
      tone="primary"
      disabled={!caseId}
      title={!caseId ? 'Record findings and an inspection before creating a plan.' : undefined}
      onClick={() => ctx.open('plan', caseId)}
    >
      Create plan
    </Button>
  ) : path === '/riwayat' ? (
    <Button permission="export" icon="print" tone="primary" onClick={() => ctx.open('report')}>
      Create report
    </Button>
  ) : (
    <>
      <Button icon="eye" onClick={() => ctx.nav('/hama?tab=detection')}>
        Review detection
      </Button>
      <Button permission="export" icon="file" onClick={() => ctx.open('report')}>
        View report
      </Button>
    </>
  );
}
