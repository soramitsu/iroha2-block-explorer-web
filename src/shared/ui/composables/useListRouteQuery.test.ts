import { describe, expect, it, vi } from 'vitest';
import { nextTick, reactive } from 'vue';

import { useListRouteQuery } from './useListRouteQuery';

const route = reactive({ query: {} as Record<string, string> });
const updateRouteQuery = vi.fn().mockResolvedValue(undefined);

vi.mock('@/shared/ui/composables/useRouteQueryState', () => ({
  useRouteQueryState: () => ({ route, updateRouteQuery }),
}));

describe('useListRouteQuery', () => {
  it('reads valid values and falls back for malformed route state', async () => {
    route.query = { page: '3', per_page: '20' };
    const state = useListRouteQuery();
    expect(state.page.value).toBe(3);
    expect(state.pageSize.value).toBe(20);

    route.query = { page: '0', per_page: '30' };
    await nextTick();
    expect(state.page.value).toBe(1);
    expect(state.pageSize.value).toBe(10);
    expect(updateRouteQuery).toHaveBeenCalledWith(
      { page: 1, per_page: 10 },
      { history: 'replace', defaults: { page: 1, per_page: 10 } }
    );
  });

  it('pushes pages and replaces page-size/filter updates with an atomic page reset', async () => {
    route.query = {};
    updateRouteQuery.mockClear();
    const state = useListRouteQuery();
    state.page.value = 4;
    state.pageSize.value = 50;
    await state.updateListQuery({ status: 'Committed' });

    expect(updateRouteQuery).toHaveBeenNthCalledWith(
      1,
      { page: 4 },
      { history: 'push', defaults: { page: 1, per_page: 10 } }
    );
    expect(updateRouteQuery).toHaveBeenNthCalledWith(
      2,
      { page: 1, per_page: 50 },
      { history: 'replace', defaults: { page: 1, per_page: 10 } }
    );
    expect(updateRouteQuery).toHaveBeenNthCalledWith(
      3,
      { page: 1, status: 'Committed' },
      { history: 'replace', defaults: { page: 1, per_page: 10 } }
    );
  });
});
