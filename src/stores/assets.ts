import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import assetsApi from '@/api/assets';
import type { AssetDto, AssetDefinitionDto } from '@/api/assets';
import type { PaginationParamsDto } from '@/core/types/common';
import { encodeHash } from '@/core/utils/encode-hash';

export const useAssetsStore = defineStore('assets', () => {
  const isLoading = ref(false);
  const asset = ref<AssetDto | null>(null);
  const assetDefinitions = shallowRef<AssetDefinitionDto[]>([]);
  const assets = shallowRef<AssetDto[]>([]);

  async function fetchAssets(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;

      const { data, pagination } = await assetsApi.fetchAssets(params);
      assets.value = data;

      return pagination;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAsset(definition_id: string, account_id: string) {
    try {
      isLoading.value = true;

      asset.value = await assetsApi.fetchAsset(encodeHash(definition_id), account_id);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAssetDefinitions(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;

      const { data } = await assetsApi.fetchAssetDefinitions(params);
      assetDefinitions.value = data;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    asset,
    assets,
    assetDefinitions,
    isLoading,
    fetchAssets,
    fetchAsset,
    fetchAssetDefinitions,
  };
});
