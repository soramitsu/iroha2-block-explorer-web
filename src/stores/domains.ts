import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { DomainDto } from '@/api/domains';
import type { PaginationParamsDto } from '@/core/types/common';
import domainsApi from '@/api/domains';

export const useDomainsStore = defineStore('domains', () => {
  const isLoading = ref(false);
  const domain = ref<DomainDto | null>(null);
  const domains = shallowRef<DomainDto[]>([]);

  async function fetchDomains(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;
      const { data, pagination } = await domainsApi.fetchDomains(params);
      domains.value = data;

      return pagination;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDomain(id: string) {
    try {
      isLoading.value = true;
      domain.value = await domainsApi.fetchDomain(id);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    domain,
    domains,
    fetchDomains,
    fetchDomain,
  };
});
