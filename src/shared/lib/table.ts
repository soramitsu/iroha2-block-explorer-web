import { reactive, Ref, ref } from 'vue';
import { transactionModel } from '~entities/transaction';

export type TableFetchFn<T> = (params: PaginationParams) => Promise<Paginated<T>>;

export type TablePagination = {
  page: number;
  page_size: number;
  pages: number;
  total: number;
};

export function useTable<T>(fetchFn: TableFetchFn<T>) {
  const loading = ref(false);

  const items: Ref<T[]> = ref([]);

  const pagination = reactive<TablePagination>({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  async function fetch() {
    loading.value = true;

    const res = await fetchFn({
      page: pagination.page,
      page_size: pagination.page_size,
    });

    items.value = res.data;
    pagination.page = res.pagination.page;
    pagination.page_size = res.pagination.page_size;
    pagination.total = res.pagination.total;
    pagination.pages = Math.ceil(res.pagination.total / res.pagination.page_size);

    loading.value = false;
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
// for generating blocksListTable in paginated way
export function useBlockTable(selectedTransaction: TransactionDto[]) {
  const loading = ref(false);
  const items: Ref<Transaction[]> = ref([]);
  const pagination = reactive<TablePagination>({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  async function fetch() {
    loading.value = true;
    const res = await transactionModel.fetchBlocksList(selectedTransaction, {
      page: pagination.page,
      page_size: pagination.page_size,
    });
    items.value = res.data;
    pagination.page = res.pagination.page;
    pagination.page_size = res.pagination.page_size;
    pagination.total = res.pagination.total;
    pagination.pages = Math.ceil(res.pagination.total / res.pagination.page_size);
    loading.value = false;
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
