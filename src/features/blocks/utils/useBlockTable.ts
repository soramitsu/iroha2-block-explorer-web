import { Ref, ref, computed } from 'vue';
import { transactionModel } from '~entities/transaction';

export type TableFetchFn<T> = (params: PaginationParams) => Promise<Paginated<T>>;

export type TablePagination = {
  page: number;
  page_size: number;
  pages: number;
  total: number;
};

export function useBlockTable() {
  const loading = ref(false);
  const selectedTransaction: Ref<TransactionDto[]> = ref([]);
  const pagination: Ref<TablePagination> = ref({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 10,
  });

  const items = computed(() => {
    const res = transactionModel.fetchBlocksList(selectedTransaction.value, {
      page: pagination.value.page,
      page_size: pagination.value.page_size,
    });

    pagination.value = {
      ...res.pagination,
      pages: Math.ceil(res.pagination.total / res.pagination.page_size),
    };

    return res.data;
  });

  function setTransaction(transaction: TransactionDto[]) {
    selectedTransaction.value = transaction;
  }

  function nextPage() {
    if (pagination.value.page < pagination.value.pages) {
      pagination.value.page += 1;
    }
  }

  function prevPage() {
    if (pagination.value.page > 1) {
      pagination.value.page -= 1;
    }
  }

  function setPage(index: number) {
    if (index !== pagination.value.page) {
      pagination.value.page = index;
    }
  }

  function setSize(n: number) {
    if (n !== pagination.value.page_size) {
      pagination.value.page_size = n;
      pagination.value.page = 1;
    }
  }

  return {
    loading,
    items,
    pagination,
    nextPage,
    prevPage,
    setPage,
    setSize,
    setTransaction,
  };
}
