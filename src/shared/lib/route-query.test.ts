import { describe, expect, it } from 'vitest';

import {
  firstRouteQueryValue,
  mergeRouteQuery,
  parseRouteEnum,
  parseRoutePositiveInteger,
  routeQueriesEqual,
} from './route-query';

describe('route query parsing', () => {
  it('reads the first string and validates positive safe integers', () => {
    expect(firstRouteQueryValue(['20', '50'])).toBe('20');
    expect(parseRoutePositiveInteger('3', 1)).toBe(3);
    expect(parseRoutePositiveInteger('0', 1)).toBe(1);
    expect(parseRoutePositiveInteger('1.5', 1)).toBe(1);
    expect(parseRoutePositiveInteger('20', 10, new Set([10, 20, 50]))).toBe(20);
    expect(parseRoutePositiveInteger('30', 10, new Set([10, 20, 50]))).toBe(10);
  });

  it('accepts only exact enum values', () => {
    const allowed = new Set(['all', 'committed'] as const);
    expect(parseRouteEnum('committed', allowed, 'all')).toBe('committed');
    expect(parseRouteEnum('Committed', allowed, 'all')).toBe('all');
  });
});

describe('mergeRouteQuery', () => {
  it('preserves unrelated and Explorer-scope values while applying a patch', () => {
    expect(
      mergeRouteQuery(
        { torii: 'https://node', dataspaceId: '2', page: '4', unrelated: 'keep' },
        { page: 2, status: 'Committed' }
      )
    ).toEqual({
      torii: 'https://node',
      dataspaceId: '2',
      page: '2',
      status: 'Committed',
      unrelated: 'keep',
    });
  });

  it('omits empty and default values atomically', () => {
    expect(
      mergeRouteQuery(
        { page: '8', per_page: '20', status: 'Rejected' },
        { page: 1, per_page: 10, status: null },
        { page: 1, per_page: 10 }
      )
    ).toEqual({});
  });
});

describe('routeQueriesEqual', () => {
  it('compares key/value content independently of key order', () => {
    expect(routeQueriesEqual({ page: '2', status: 'ok' }, { status: 'ok', page: '2' })).toBe(true);
    expect(routeQueriesEqual({ page: '2' }, { page: '3' })).toBe(false);
  });
});
