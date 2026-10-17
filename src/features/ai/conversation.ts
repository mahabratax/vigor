import type { DomainState } from '../../domain/types';
import type { AssistantIssue } from '../../domain/assistant';
import { production } from '../../domain/production';

export interface AssistantReply {
  intro: string;
  matches: AssistantIssue[];
  followUp?: boolean;
  fallback?: boolean;
}
export interface AssistantTurn {
  id: number;
  question: string;
  issueId?: string;
  mode?: 'records' | 'gemini';
}
export const suggestedQuestions = [
  'What needs attention?',
  'Check watering',
  'Review harvest & cash',
];
const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Bounded local lookup, not an LLM response. Re-derived from current records on every render. */
export function replyFor(
  s: DomainState,
  turn: AssistantTurn,
  issues: AssistantIssue[],
): AssistantReply {
  const q = normalize(turn.question),
    p = production(s);
  if (turn.issueId) {
    const issue = issues.find((i) => i.id === turn.issueId);
    return {
      intro: !issue
        ? 'This priority is no longer available in the current records. Open the greenhouse records to review its history.'
        : issue.resolved
          ? 'The source records now show this issue as reviewed.'
          : 'Here is the current record.',
      matches: issue ? [issue] : [],
    };
  }
  if (/\b(tasks?|follow[ -]?ups?|assigned|tugas)\b/.test(q)) {
    const tasks = p.tasks.filter((t) => t.key.startsWith('assistant-v1:'));
    const pending = tasks.filter((t) => t.status === 'pending').length;
    return {
      intro: `${pending} follow-up task${pending === 1 ? '' : 's'} still need work. ${tasks.length - pending} have results recorded.`,
      matches: [],
      followUp: true,
    };
  }
  let matches = issues.filter((i) => !i.resolved),
    intro = '',
    recognized = true;
  if (
    /\b(payment|payments|receipt|receipts|cash|invoice|receivable|unpaid|pembayaran)\b/.test(q) &&
    !/harvest/.test(q)
  ) {
    matches = matches.filter((i) => i.id.includes(':sale:'));
    intro = 'Here are the outstanding payments in the saved sales records.';
  } else if (/\b(profit|margin|cost|costs|laba|biaya|savings?)\b/.test(q)) {
    matches = matches.filter((i) => i.id.endsWith(':profit-review'));
    intro = 'These are the cost reviews needed before reporting profit.';
  } else if (/\b(harvest|stock|sales?|sell|panen|jual)\b/.test(q)) {
    matches = matches.filter((i) => i.focus.includes('business'));
    intro = 'Start here to move harvested produce through to payment.';
  } else if (
    /\b(water|watering|irrigation|routines?|sensor|nutrient|pupuk|siram|moisture)\b/.test(q)
  ) {
    matches = matches.filter((i) => i.focus.includes('resources'));
    matches.sort(
      (a, b) =>
        Number(b.id.endsWith(':routine-checks')) - Number(a.id.endsWith(':routine-checks')) ||
        a.rank - b.rank,
    );
    intro = 'Review these conditions before changing water or routine settings.';
  } else if (
    /\b(plant|plants|pest|pests|health|inspect|inspection|hama|tanaman|disease)\b/.test(q)
  ) {
    matches = matches.filter((i) => i.focus.includes('health'));
    intro = 'This plant-health finding needs attention first.';
  } else if (/\b(attention|priority|priorities|today|first|next|summary|prioritas)\b/.test(q)) {
    intro = 'Start with this. It connects a recorded finding to work you can do next.';
  } else recognized = false;

  const requestedZone = /\b(?:zone|zona)\s+([a-z0-9-]+)\b/.exec(q)?.[1];
  if (requestedZone) {
    const zone = s.zones.find((z) => normalize(z.id) === requestedZone);
    matches = zone
      ? matches.filter((i) => {
          if (i.followUp?.zoneId === zone.id) return true;
          if (s.cases.some((c) => i.id.endsWith(`:case:${c.id}`) && c.zoneId === zone.id))
            return true;
          if (p.lots.some((l) => i.id.endsWith(`:lot:${l.id}`) && l.zoneId === zone.id))
            return true;
          return p.sales.some(
            (x) =>
              i.id.endsWith(`:sale:${x.id}`) &&
              p.lots.find((l) => l.id === x.lotId)?.zoneId === zone.id,
          );
        })
      : [];
    if (!recognized) {
      recognized = true;
      intro = 'Here are the matching zone records.';
    }
  }
  if (!recognized) {
    const tokens = q
      .split(/[^a-z0-9-]+/)
      .filter(
        (w) =>
          w.length > 2 &&
          ![
            'what',
            'this',
            'that',
            'have',
            'does',
            'with',
            'about',
            'show',
            'please',
            'could',
            'would',
            'the',
            'and',
            'for',
            'can',
            'you',
            'how',
            'why',
          ].includes(w),
      );
    matches = tokens.length
      ? matches.filter((i) =>
          tokens.some((t) =>
            normalize(`${i.title} ${i.evidence.map((e) => e.value).join(' ')}`).includes(t),
          ),
        )
      : [];
    intro = 'I found these matching priorities in your records.';
  }
  if (!matches.length)
    return {
      intro: recognized
        ? 'No matching open priority is recorded. This does not confirm that field conditions are healthy.'
        : 'I can look up plant health, watering, harvests, payments and follow-up tasks. General AI questions need a connected model.',
      matches: [],
      fallback: !recognized,
    };
  return { intro, matches };
}
