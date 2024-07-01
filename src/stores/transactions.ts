import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { PaginationParamsDto } from '@/core/types/common';
import type { TransactionDto } from '@/api/transactions';
import transactionsApi from '@/api/transactions';

export const useTransactionsStore = defineStore('transactions', () => {
  const isLoading = ref(false);
  const transactions = shallowRef<TransactionDto[]>([]);

  async function fetchTransactions(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;

      const { data, pagination } = await transactionsApi.fetchTransactions(params);
      // TODO: map transactions using mapTransactionFromDto
      transactions.value = data;

      return pagination;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    transactions,
    fetchTransactions,
  };
});
