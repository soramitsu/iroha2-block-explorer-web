/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
export {};

declare global {
  type BlockHeader = {
    timestamp: string;
    consensus_estimation: string;
    height: string;
    previous_block_hash: string;
    transactions_hash: string;
    rejected_transactions_hash: string;
    invalidated_blocks_hashes: string[];
  }

  type CommittedBlock = {
    header: BlockHeader;
    rejected_transactions: string[];
    transactions: string[];
  }
}
