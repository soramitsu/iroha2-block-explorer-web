import type { Ref } from 'vue';
import { reactive, ref } from 'vue';
import type { Paginated, Pagination, PaginationParams } from '@/shared/api/schemas';

export type TableFetchFn<T> = (params: PaginationParams) => Promise<Paginated<T>>;

export function useTable<T>(fetchFn: TableFetchFn<T>, options?: { sticky?: boolean }) {
  const loading = ref(false);
  const additionalFetchingParams = ref<Record<string, any> | null>(null);

  const items: Ref<T[]> = ref([]);

  const isFirstFetch = ref(true);
  const isLengthBiggerThanPerPage = ref(false);

  const pagination = reactive<Pagination>({
    page: 1,
    per_page: 10,
    total_pages: 1,
    total_items: 10,
  });

  async function fetch(params?: Record<string, any>) {
    loading.value = true;

    if (params) additionalFetchingParams.value = params;
    const res = await fetchFn({
      ...((!options?.sticky ||
        (options?.sticky && !isFirstFetch.value && pagination.page !== pagination.total_pages)) && {
        page: pagination.page,
      }),
      per_page: pagination.per_page,
      ...additionalFetchingParams.value,
    });

    if (isFirstFetch.value) isLengthBiggerThanPerPage.value = res.items.length !== res.pagination.per_page;

    items.value = res.items;
    pagination.page = res.pagination.page;
    pagination.per_page = res.pagination.per_page;
    pagination.total_items = res.pagination.total_items;
    pagination.total_pages = res.pagination.total_pages;

    if (options?.sticky && isLengthBiggerThanPerPage.value) {
      pagination.total_pages--;
      pagination.page--;
    }

    loading.value = false;
    isFirstFetch.value = false;
  }

  async function nextPage() {
    if (options?.sticky) {
      if (pagination.page > 1) {
        pagination.page--;
        await fetch();

        if (isLengthBiggerThanPerPage.value) pagination.page++;
      }
    } else if (pagination.page < pagination.total_pages) {
      pagination.page += 1;
      await fetch();
    }
  }

  async function prevPage() {
    if (options?.sticky) {
      if (pagination.page < pagination.total_pages) {
        pagination.page++;
        await fetch();
        if (pagination.page !== pagination.total_pages) pagination.page++;
      }
    } else if (pagination.page > 1) {
      pagination.page -= 1;
      await fetch();
    }
  }

  async function setPage(index: number) {
    if (index !== pagination.page) {
      pagination.page = index;
      await fetch();
      if (options?.sticky) {
        if (pagination.page < index) pagination.page++;
        else if (pagination.page > index) pagination.page--;
      }
    }
  }

  async function setSize(n: number) {
    if (n !== pagination.per_page) {
      isFirstFetch.value = true;
      pagination.per_page = n;
      pagination.page = 1;
      await fetch();
    }
  }

  return {
    loading,
    items,
    pagination,
    fetch,
    nextPage,
    prevPage,
    setPage,
    setSize,
  };
}
