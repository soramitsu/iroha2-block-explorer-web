import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function usePagination(
  params: ComputedRef<{
    items: number
    reversed: boolean
    totalItems?: number
    totalPages: number
    page: number
    pageSize: number
    activePage: number
    isMobile: boolean
  }>
) {
  const { t } = useI18n();

  const segmentInfo = computed(() => {
    if (!params.value.totalItems) return t('table.pageOf', [0, 0, 0]);

    const start = (params.value.page - 1) * params.value.pageSize + 1;
    const end = params.value.page * params.value.pageSize;

    if (params.value.reversed && params.value.activePage) {
      if (params.value.pageSize > params.value.totalItems)
        return t('table.pageOf', [params.value.totalItems, 1, params.value.totalItems]);

      const start = (params.value.activePage - 1) * params.value.pageSize + params.value.items;

      const end = start - params.value.items + 1;

      return t('table.pageOf', [start, end, params.value.totalItems]);
    }

    return t('table.pageOf', [
      start,
      end > params.value.totalItems ? params.value.totalItems : end,
      params.value.totalItems,
    ]);
  });

  const numbers = computed(() => {
    if (!params.value.totalItems) return [];

    const max = params.value.isMobile ? 6 : 10;
    const side = params.value.isMobile ? 4 : 7;
    const offset = params.value.isMobile ? 1 : 3;

    if (params.value.reversed) {
      if (params.value.totalPages < max) {
        return new Array(params.value.totalPages)
          .fill(0)
          .map((_, i) => i + 1)
          .reverse();
      } else if (params.value.activePage < side) {
        const numbersArray = Array(side)
          .fill(0)
          .map<string | number>((_, i) => i + 1);

        return [params.value.totalPages, '. . .'].concat(numbersArray.reverse());
      } else if (params.value.activePage > params.value.totalPages - side + 1) {
        return Array(side)
          .fill(params.value.totalPages)
          .map<string | number>((_, i) => _ - i)
          .concat(['. . .', 1]);
      } else {
        const start = Math.max(params.value.page - offset, 1);
        const end = Math.min(params.value.page + offset, params.value.totalPages);

        const middleNumbers = new Array(end - start + 1).fill(0).map((_, i) => i + start);

        return [params.value.totalPages, '. . .', ...middleNumbers.reverse(), '. . .', 1];
      }
    }

    if (params.value.totalPages < max) {
      return new Array(params.value.totalPages).fill(0).map((_, i) => i + 1);
    }

    if (params.value.page < side) {
      return Array(side)
        .fill(0)
        .map<string | number>((_, i) => i + 1)
        .concat(['. . .', params.value.totalPages]);
    }

    if (params.value.page > params.value.totalPages - side + 1) {
      return [1, '. . .'].concat(
        Array(side)
          .fill(0)
          .map((_, i) => params.value.totalPages - i)
          .reverse()
      );
    }

    const start = Math.max(params.value.page - offset, 1);
    const end = Math.min(params.value.page + offset, params.value.totalPages);

    const middleNumbers = new Array(end - start + 1).fill(0).map((_, i) => i + start);

    return [1, '. . .', ...middleNumbers, '. . .', params.value.totalPages];
  });

  return {
    segmentInfo,
    numbers,
  };
}
