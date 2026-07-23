import { describe, expect, it, vi } from 'vitest';
import { NOT_FOUND, SUCCESSFUL_FETCHING, UNKNOWN_ERROR } from '@/shared/api/consts';
import type { RWA } from '@/shared/api/schemas';
import { fetchRwaProvenanceResource, type RwaResourceResult } from './rwa-provenance-resource';

function rwa(id: string, parents: Array<{ rwa: string, quantity: { toString: () => string } }> = []): RWA {
  return {
    id,
    parents,
    owned_by: 'alice@wonderland',
    quantity: { toString: () => '10' },
    held_quantity: { toString: () => '0' },
    primary_reference: null,
    status: null,
    is_frozen: false,
    metadata: {},
  } as unknown as RWA;
}

describe('fetchRwaProvenanceResource', () => {
  it('builds the graph from one authoritative root fetch and its available ancestors', async () => {
    const fetchRwa = vi.fn(async (id: string): Promise<RwaResourceResult> => ({
      status: SUCCESSFUL_FETCHING,
      data: id === 'child$goods'
        ? rwa('child$goods', [{ rwa: 'parent$goods', quantity: { toString: () => '7' } }])
        : rwa('parent$goods'),
    }));

    const result = await fetchRwaProvenanceResource('child$goods', fetchRwa);

    expect('root' in result && result.root.id).toBe('child$goods');
    expect('graph' in result && result.graph.nodes.map((node) => node.id)).toEqual(['parent$goods', 'child$goods']);
    expect(fetchRwa.mock.calls).toEqual([['child$goods'], ['parent$goods']]);
  });

  it('preserves a root not-found result instead of fabricating an empty graph', async () => {
    const fetchRwa = vi.fn(async (): Promise<RwaResourceResult> => ({ status: NOT_FOUND }));

    await expect(fetchRwaProvenanceResource('missing$goods', fetchRwa)).resolves.toEqual({ status: NOT_FOUND });
    expect(fetchRwa).toHaveBeenCalledTimes(1);
  });

  it('preserves a root request error for the shared terminal error state', async () => {
    const error = new Error('offline');
    const fetchRwa = vi.fn(async (): Promise<RwaResourceResult> => ({ status: UNKNOWN_ERROR, error }));

    await expect(fetchRwaProvenanceResource('child$goods', fetchRwa)).resolves.toEqual({
      status: UNKNOWN_ERROR,
      error,
    });
  });

  it('keeps a valid root visible and marks an unavailable ancestor as a graph gap', async () => {
    const fetchRwa = vi.fn(async (id: string): Promise<RwaResourceResult> =>
      id === 'child$goods'
        ? {
            status: SUCCESSFUL_FETCHING,
            data: rwa('child$goods', [{ rwa: 'missing$goods', quantity: { toString: () => '3' } }]),
          }
        : { status: NOT_FOUND }
    );

    const result = await fetchRwaProvenanceResource('child$goods', fetchRwa);

    expect('missingAncestorIds' in result && result.missingAncestorIds).toEqual(['missing$goods']);
    expect('graph' in result && result.graph.nodes.find((node) => node.id === 'missing$goods')?.isPlaceholder).toBe(true);
  });
});
