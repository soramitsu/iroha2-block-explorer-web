import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { PeerDto, PeerStatusDto } from '@/api/peers';
import peersApi from '@/api/peers';
import type { PaginationParamsDto } from '@/core/types/common';

export const usePeersStore = defineStore('peers', () => {
  const isLoading = ref(false);
  const peers = shallowRef<PeerDto[]>([]);
  const peerStatus = ref<PeerStatusDto | null>(null);

  async function fetchPeers(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;
      const { data } = await peersApi.fetchPeers(params);
      peers.value = data;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPeerStatus() {
    try {
      isLoading.value = true;

      // 500 Internal server error
      peerStatus.value = await peersApi.fetchPeerStatus();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    peers,
    peerStatus,
    fetchPeers,
    fetchPeerStatus,
  };
});
