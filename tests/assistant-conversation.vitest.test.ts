import { expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { materialize } from '../db/codec';
import { addStarterRecords } from '../src/data/starterRecords';
import { assistantIssues } from '../src/domain/assistant';
import { replyFor } from '../src/features/ai/conversation';

function state() {
  const s = materialize(createFixture());
  s.clock = Date.parse('2026-10-16T03:00:00Z') / 1000;
  addStarterRecords({ [s.greenhouse.id]: s });
  return s;
}
it('looks up payments, routine blockers and harvest holds without changing data', () => {
  const s = state(),
    before = JSON.stringify(s),
    issues = assistantIssues(s);
  expect(
    replyFor(s, { id: 1, question: 'Show unpaid payments' }, issues).matches.every((i) =>
      i.id.includes(':sale:'),
    ),
  ).toBe(true);
  expect(replyFor(s, { id: 2, question: 'Check watering' }, issues).matches[0].id).toContain(
    ':routine-checks',
  );
  expect(
    replyFor(s, { id: 3, question: 'Review harvest & cash' }, issues).matches[0].impact.value,
  ).toBe('16 kg');
  expect(JSON.stringify(s)).toBe(before);
});
it('keeps named zone questions scoped and does not substitute a different zone', () => {
  const s = state(),
    issues = assistantIssues(s);
  const result = replyFor(s, { id: 1, question: 'Inspect plants in Zone B' }, issues);
  expect(result.matches.length).toBeGreaterThan(0);
  expect(result.matches.every((i) => i.followUp?.zoneId === 'B')).toBe(true);
  expect(replyFor(s, { id: 2, question: 'Inspect plants in Zone Q' }, issues).matches).toEqual([]);
});
it('explains unsupported questions and expired priority links without inventing a reply', () => {
  const s = state(),
    issues = assistantIssues(s);
  expect(replyFor(s, { id: 1, question: 'Write a poem about Mars' }, issues)).toMatchObject({
    fallback: true,
    matches: [],
  });
  const missing = replyFor(
    s,
    { id: 2, question: 'Review the old case', issueId: 'missing' },
    issues,
  );
  expect(missing.matches).toEqual([]);
  expect(missing.intro).toContain('no longer available');
});
