import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { PaginationParamsDto } from '@/core/types/common';
import type { BlockShallow } from '@/api/blocks';
import blocksApi from '@/api/blocks';

export const useBlocksStore = defineStore('blocks', () => {
  const isLoading = ref(false);
  const blocks = shallowRef<BlockShallow[]>([]);

  async function fetchBlocks(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;

      const { data, pagination } = await blocksApi.fetchBlocks(params);
      blocks.value = data;

      return pagination;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    blocks,
    fetchBlocks,
  };
});
