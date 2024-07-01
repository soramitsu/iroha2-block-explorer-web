import { reactive } from 'vue';
import type { PaginationInfo, PaginationParamsDto } from '@/core/types/common';

export type TableFetchFn = (params: PaginationParamsDto) => Promise<PaginationInfo | undefined>;

export interface TablePagination {
  page: number
  page_size: number
  pages: number
  total: number
}

export function useTable(fetchFn: TableFetchFn) {
  const pagination = reactive<TablePagination>({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  async function fetch() {
    const newPagination = await fetchFn({
      page: pagination.page,
      page_size: pagination.page_size,
    });

    if (!newPagination) return;

    pagination.page = newPagination.page;
    pagination.page_size = newPagination.page_size;
    pagination.total = newPagination.total;
    pagination.pages = Math.ceil(newPagination.total / newPagination.page_size);
  }

  async function nextPage() {
    if (pagination.page < pagination.pages) {
      pagination.page += 1;
      await fetch();
    }
  }

  async function prevPage() {
    if (pagination.page > 1) {
      pagination.page -= 1;
      await fetch();
    }
  }

  async function setPage(index: number) {
    if (index !== pagination.page) {
      pagination.page = index;
      await fetch();
    }
  }

  async function setSize(n: number) {
    if (n !== pagination.page_size) {
      pagination.page_size = n;
      pagination.page = 1;
      await fetch();
    }
  }

  return {
    pagination,
    fetch,
    nextPage,
    prevPage,
    setPage,
    setSize,
  };
}
