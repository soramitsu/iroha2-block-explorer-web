import { PaginationParams } from '@/http';
import { reactive, Ref, ref } from 'vue';

export type TableFetchFn<T> = (params: PaginationParams) => Promise<Paginated<T>>;

export type TablePagination = {
  page_number: number;
  page_size: number;
  pages: number;
  total: number;
};

export function useTable<T>(fetchFn: TableFetchFn<T>) {
  const loading = ref(false);

  const items: Ref<T[]> = ref([]);

  const pagination = reactive<TablePagination>({
    page_number: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  async function fetch() {
    loading.value = true;

    const data = await fetchFn({
      page: pagination.page_number,
      page_size: pagination.page_size,
    });

    // pagination not ready on backend

    // items.value = data.items.slice();
    // pagination.page_number = data.pagination.page_number;
    // pagination.page_size = data.pagination.page_size;
    // pagination.pages = data.pagination.pages;

    items.value = data.items.slice(pagination.page_size * (pagination.page_number - 1), pagination.page_size * pagination.page_number);
    pagination.pages = Math.floor(data.items.length / pagination.page_size) || 1;
    pagination.total = data.items.length;

    loading.value = false;
  }

  async function nextPage() {
    if (pagination.page_number < pagination.pages) {
      pagination.page_number += 1;
      await fetch();
    }
  }

  async function prevPage() {
    if (pagination.page_number > 1) {
      pagination.page_number -= 1;
      await fetch();
    }
  }

  async function setPage(index: number) {
    if (index !== pagination.page_number) {
      pagination.page_number = index;
      await fetch();
    }
  }

  async function setSize(n: number) {
    if (n !== pagination.page_size) {
      pagination.page_size = n;
      pagination.page_number = 1;
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
