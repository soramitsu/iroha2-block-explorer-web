import type { AxiosInstance } from 'axios';
import type { Paginated, PaginationParamsDto } from '@/core/types/common';
import { axiosInstance } from '@/api/instance';

export interface BlockShallow {
  height: number
  /**
   * ISO DateTime
   */
  timestamp: string
  block_hash: string
  /**
   * Transactions count
   */
  transactions: number
  /**
   * Rejected transactions count
   */
  rejected_transactions: number
}

export interface Block {
  height: number
  /**
   * See {@link BlockShallow.timestamp}
   */
  timestamp: string
  block_hash: string
  parent_block_hash: string
  rejected_transactions_merkle_root_hash: string
  invalidated_blocks_hashes: string[]
  /**
   * List of serialized {@link @iroha2/data-model#VersionedValidTransaction}
   */
  transactions: string[]
  /**
   * List of serialized {@link @iroha2/data-model#VersionedRejectedTransaction}
   */
  rejected_transactions: string[]
  /**
   * List of hashes. WIP always empty
   */
  view_change_proofs: string[]
}

class BlocksApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchBlocks(params?: PaginationParamsDto): Promise<Paginated<BlockShallow>> {
    return this.axiosInstance.get('/blocks', { params }).then(({ data }) => data);
  }
}

export default new BlocksApi(axiosInstance);
