import { describe, expect, it } from 'vitest';
import { advanceHistoryScanCursor, createHistoryScanCursor } from './history-scan';
import tairaHistory from '../../../tests/fixtures/taira-history.json';

const FIRST_CURSOR = tairaHistory.blocks.pagination.next_cursor;
const SECOND_CURSOR = tairaHistory.latestTransactions.pagination.next_cursor;

const page = (next: string | null) => ({
  limit: 100, snapshot_height: 12, snapshot_hash: 'ab'.repeat(32),
  next_cursor: next, has_more: next !== null,
});

describe('history scan cursor', () => {
  it('preserves the server snapshot across opaque continuations and exhaustion', () => {
    const first = advanceHistoryScanCursor(createHistoryScanCursor(), page(FIRST_CURSOR));
    const next = advanceHistoryScanCursor(first, page(SECOND_CURSOR));
    expect(next.nextCursor).toBe(SECOND_CURSOR);
    expect(next.snapshot).toEqual(first.snapshot);
    expect(advanceHistoryScanCursor(next, page(null)).nextCursor).toBeNull();
  });

  it('rejects repeated cursors, including a cycle through earlier pages', () => {
    const first = advanceHistoryScanCursor(createHistoryScanCursor(), page(FIRST_CURSOR));
    expect(() => advanceHistoryScanCursor(first, page(FIRST_CURSOR))).toThrow('did not advance');
    const second = advanceHistoryScanCursor(first, page(SECOND_CURSOR));
    expect(() => advanceHistoryScanCursor(second, page(FIRST_CURSOR))).toThrow('did not advance');
  });

  it('rejects changed snapshot height or hash before accepting a page', () => {
    const first = advanceHistoryScanCursor(createHistoryScanCursor(), page(FIRST_CURSOR));
    expect(() => advanceHistoryScanCursor(first, { ...page(null), snapshot_height: 13 })).toThrow('snapshot changed');
    expect(() => advanceHistoryScanCursor(first, { ...page(null), snapshot_hash: 'cd'.repeat(32) })).toThrow('snapshot changed');
  });

  it('rejects inconsistent pagination and accepts the genuine empty-ledger snapshot', () => {
    expect(() => advanceHistoryScanCursor(createHistoryScanCursor(), { ...page(null), has_more: true })).toThrow();
    expect(advanceHistoryScanCursor(createHistoryScanCursor(), {
      ...page(null), snapshot_height: 0, snapshot_hash: null,
    }).snapshot).toEqual({ height: 0, hash: null });
  });
});
