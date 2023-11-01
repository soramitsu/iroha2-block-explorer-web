import { Ref, ref } from 'vue';
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

  const pagination = ref<TablePagination>({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  async function fetch() {
    loading.value = true;

    const res = await fetchFn({
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    });

    items.value = res.data;
    pagination.value.page = res.pagination.page;
    pagination.value.page_size = res.pagination.page_size;
    pagination.value.total = res.pagination.total;
    pagination.value.pages = Math.ceil(res.pagination.total / res.pagination.page_size);

    loading.value = false;
  }

  async function nextPage() {
    if (pagination.value.page < pagination.value.pages) {
      pagination.value.page += 1;
      await fetch();
    }
  }

  async function prevPage() {
    if (pagination.value.page > 1) {
      pagination.value.page -= 1;
      await fetch();
    }
  }

  async function setPage(index: number) {
    if (index !== pagination.value.page) {
      pagination.value.page = index;
      await fetch();
    }
  }

  async function setSize(n: number) {
    if (n !== pagination.value.page_size) {
      pagination.value.page_size = n;
      pagination.value.page = 1;
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
export function useBlockTable() {
  const loading = ref(false);
  const items: Ref<Transaction[]> = ref([]);
  const pagination = ref<TablePagination>({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  // a FUNCTION TO MAKE THE CONTENT PAGINATED FIRST TIME
  const selectedTransaction:Ref<TransactionDto[]> = ref([]);

  function setTransaction(transaction: TransactionDto[]) {
    selectedTransaction.value = transaction;
  }

  async function fetch() {
    loading.value = true;
    const res = await transactionModel.fetchBlocksList(selectedTransaction.value, {
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    });

    items.value = res.data;
    pagination.value.page = res.pagination.page;
    pagination.value.page_size = res.pagination.page_size;
    pagination.value.total = res.pagination.total;
    pagination.value.pages = Math.ceil(res.pagination.total / res.pagination.page_size);
    loading.value = false;
  }
  async function nextPage() {
    if (pagination.value.page < pagination.value.pages) {
      pagination.value.page += 1;
      await fetch();
    }
  }

  async function prevPage() {
    if (pagination.value.page > 1) {
      pagination.value.page -= 1;
      await fetch();
    }
  }

  async function setPage(index: number) {
    if (index !== pagination.value.page) {
      pagination.value.page = index;
      await fetch();
    }
  }

  async function setSize(n: number) {
    if (n !== pagination.value.page_size) {
      pagination.value.page_size = n;
      pagination.value.page = 1;
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
    setTransaction,
  };
}
