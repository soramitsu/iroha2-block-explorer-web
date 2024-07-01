import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { AccountDto } from '@/api/accounts';
import accountsApi from '@/api/accounts';
import type { PaginationParamsDto } from '@/core/types/common';

export const useAccountsStore = defineStore('accounts', () => {
  const isLoading = ref(false);
  const account = ref<AccountDto | null>(null);
  const accounts = shallowRef<AccountDto[]>([]);

  async function fetchAccounts(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;

      const { data, pagination } = await accountsApi.fetchAccounts(params);
      accounts.value = data;

      return pagination;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAccount(id: string) {
    try {
      isLoading.value = true;

      account.value = await accountsApi.fetchAccount(id);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    account,
    accounts,
    fetchAccounts,
    fetchAccount,
  };
});
