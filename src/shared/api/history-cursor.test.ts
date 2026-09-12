import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBlocks, fetchLatestTransactions } from './index';
import { Block, HistoryCursorPaginated, HistoryCursorPagination, LatestTransactionsResponse } from './schemas';
import { jsonResponse } from '../../../tests/fixtures/http-response';
import tairaHistory from '../../../tests/fixtures/taira-history.json';

// Recorded from the public Taira v1 API on 2026-09-12. The deployed Explorer's
// former 192-character history limit rejected both successful HTTP responses.
const blockCursor = tairaHistory.blocks.pagination.next_cursor;
const nativeFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = nativeFetch;
});

describe('current snapshot-bound Taira history contract', () => {
  it('parses the complete public block and latest-transaction responses', () => {
    expect(blockCursor).toHaveLength(204);
    const blocks = HistoryCursorPaginated(Block).parse(tairaHistory.blocks);
    const latest = LatestTransactionsResponse.parse(tairaHistory.latestTransactions);

    expect(blocks.pagination).toEqual(tairaHistory.blocks.pagination);
    expect(blocks.items[0].height).toBe(835);
    expect(blocks.items[0].created_at).toEqual(new Date('2026-09-12T03:30:05.553Z'));
    expect(latest.pagination).toEqual(tairaHistory.latestTransactions.pagination);
    expect(latest.items[0].authority).toBe(tairaHistory.latestTransactions.items[0].authority);
  });

  it.each([
    ['retired short frame', blockCursor.slice(0, 192)],
    ['truncated frame', blockCursor.slice(0, 203)],
    ['oversized frame', `${blockCursor}A`],
    ['decoder admission ceiling', `${blockCursor}AAAA`],
    ['collection cursor limit', `SUhDMg${'A'.repeat(1418)}`],
    ['retired IHC1 marker', `SUhDMQ${blockCursor.slice(6)}`],
    ['padded base64', `${blockCursor.slice(0, -1)}=`],
    ['non-base64url data', `${blockCursor.slice(0, -1)}+`],
  ])('rejects %s instead of accepting another history format', (_, nextCursor) => {
    expect(HistoryCursorPagination.safeParse({
      ...tairaHistory.blocks.pagination,
      next_cursor: nextCursor,
    }).success).toBe(false);
  });

  it('accepts an exhausted snapshot and rejects inconsistent continuation metadata', () => {
    const exhausted = { ...tairaHistory.blocks.pagination, next_cursor: null, has_more: false };
    expect(HistoryCursorPagination.parse(exhausted)).toEqual(exhausted);
    expect(HistoryCursorPagination.safeParse({ ...exhausted, has_more: true }).success).toBe(false);
    expect(HistoryCursorPagination.safeParse({ ...exhausted, next_cursor: blockCursor }).success).toBe(false);
  });

  it('loads a block page through the installed SDK and forwards its opaque cursor unchanged', async () => {
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(jsonResponse(tairaHistory.blocks))
      .mockResolvedValueOnce(jsonResponse({
        items: [],
        pagination: { ...tairaHistory.blocks.pagination, next_cursor: null, has_more: false },
      }));
    globalThis.fetch = fetchSpy;

    const first = await fetchBlocks({ limit: 2 });
    expect(first.status).toBe('ok');
    if (first.status !== 'ok') throw new Error('Expected the public Taira block page to load');
    expect(first.data.items).toHaveLength(2);
    expect(first.data.pagination.next_cursor).toBe(blockCursor);

    const second = await fetchBlocks({ limit: 2, cursor: first.data.pagination.next_cursor });
    expect(second.status).toBe('ok');
    const url = new URL(String(fetchSpy.mock.calls[1][0]));
    expect(url.pathname).toBe('/v1/explorer/blocks');
    expect(url.searchParams.get('limit')).toBe('2');
    expect(url.searchParams.get('cursor')).toBe(blockCursor);
  });

  it('loads latest transactions through the installed SDK with the complete history envelope', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse(tairaHistory.latestTransactions));
    globalThis.fetch = fetchSpy;

    const latest = await fetchLatestTransactions({ limit: 2 });
    expect(latest.status).toBe('ok');
    if (latest.status !== 'ok') throw new Error('Expected the public Taira transaction page to load');
    expect(latest.data.items).toHaveLength(2);
    expect(latest.data.pagination).toEqual(tairaHistory.latestTransactions.pagination);
    const url = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(url.pathname).toBe('/v1/explorer/transactions/latest');
    expect(url.searchParams.get('limit')).toBe('2');
  });
});
