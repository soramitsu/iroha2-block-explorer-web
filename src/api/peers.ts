import type { AxiosInstance } from 'axios';
import { axiosInstance } from '@/api/instance';
import type { Paginated, PaginationParamsDto } from '@/core/types/common';

export interface PeerDto {
  address: string
  public_key: string
  // public_key: PublicKey
}

export interface PeerStatusDto {
  peers: string
  blocks: string
  txs: string
  uptime: {
    secs: string
    nanos: string
  }
}

class PeersApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchPeers(params?: PaginationParamsDto): Promise<Paginated<PeerDto>> {
    return this.axiosInstance.get('/peer/peers', { params }).then(({ data }) => data);
  }

  fetchPeerStatus(): Promise<PeerStatusDto> {
    return this.axiosInstance.get('/peer/status').then(({ data }) => data);
  }
}

export default new PeersApi(axiosInstance);
