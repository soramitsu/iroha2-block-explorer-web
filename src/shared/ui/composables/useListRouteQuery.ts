import { computed, watch } from 'vue';

import { firstRouteQueryValue, parseRoutePositiveInteger, type RouteQueryPatchValue } from '@/shared/lib/route-query';
import { useRouteQueryState } from '@/shared/ui/composables/useRouteQueryState';

const PAGE_SIZES = new Set([10, 20, 50, 100]);

export function useListRouteQuery(
  options: {
    pageKey?: string
    pageSizeKey?: string
    defaultPageSize?: number
  } = {}
) {
  const pageKey = options.pageKey ?? 'page';
  const pageSizeKey = options.pageSizeKey ?? 'per_page';
  const defaultPageSize = options.defaultPageSize ?? 10;
  const { route, updateRouteQuery } = useRouteQueryState();
  const defaults = { [pageKey]: 1, [pageSizeKey]: defaultPageSize };

  const page = computed({
    get: () => parseRoutePositiveInteger(route.query[pageKey], 1),
    set: (value: number) => {
      updateRouteQuery({ [pageKey]: value }, { history: 'push', defaults }).catch(() => undefined);
    },
  });
  const pageSize = computed({
    get: () => parseRoutePositiveInteger(route.query[pageSizeKey], defaultPageSize, PAGE_SIZES),
    set: (value: number) => {
      const normalized = PAGE_SIZES.has(value) ? value : defaultPageSize;
      updateRouteQuery(
        { [pageKey]: 1, [pageSizeKey]: normalized },
        { history: 'replace', defaults }
      ).catch(() => undefined);
    },
  });

  async function updateListQuery(
    patch: Record<string, RouteQueryPatchValue>,
    config: { history?: 'push' | 'replace', resetPage?: boolean } = {}
  ) {
    await updateRouteQuery(
      { ...(config.resetPage === false ? {} : { [pageKey]: 1 }), ...patch },
      { history: config.history ?? 'replace', defaults }
    );
  }

  watch(
    () => [route.query[pageKey], route.query[pageSizeKey]] as const,
    ([rawPage, rawPageSize]) => {
      const pageValue = page.value;
      const pageSizeValue = pageSize.value;
      const normalizedPage = firstRouteQueryValue(rawPage);
      const normalizedPageSize = firstRouteQueryValue(rawPageSize);
      const shouldCanonicalizePage = normalizedPage !== null && normalizedPage !== String(pageValue);
      const shouldCanonicalizePageSize = normalizedPageSize !== null && normalizedPageSize !== String(pageSizeValue);
      const containsExplicitDefault = normalizedPage === '1' || normalizedPageSize === String(defaultPageSize);
      if (!shouldCanonicalizePage && !shouldCanonicalizePageSize && !containsExplicitDefault) return;

      updateRouteQuery(
        { [pageKey]: pageValue, [pageSizeKey]: pageSizeValue },
        { history: 'replace', defaults }
      ).catch(() => undefined);
    },
    { immediate: true }
  );

  return { route, page, pageSize, updateListQuery };
}
