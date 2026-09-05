<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Block, LedgerStateProof, LedgerStateRoot } from '@/shared/api/schemas';
import type { TransactionBlockEvidence } from '@/shared/api';
import * as http from '@/shared/api';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseResourceState from '@/shared/ui/components/BaseResourceState.vue';
import DataField from '@/shared/ui/components/DataField.vue';
import {
  loadTransactionEvidence,
  stateEvidenceAgreement,
  verifyTransactionBlockEvidence,
  type TransactionEvidenceBundle,
} from '@/shared/lib/transaction-evidence';
import { setupAsyncData } from '@/shared/utils/setup-async-data';

const props = defineProps<{
  blockHeight: number;
  transactionHash: string;
}>();

type EvidenceBundle = TransactionEvidenceBundle<TransactionBlockEvidence, Block, LedgerStateRoot, LedgerStateProof>;

const evidenceResource = setupAsyncData<EvidenceBundle>(() =>
  loadTransactionEvidence({
    fetchBlockProof: () => http.fetchLedgerBlockProof(props.blockHeight, props.transactionHash),
    fetchReferenceBlock: () => http.fetchBlock(props.blockHeight),
    fetchStateRoot: () => http.fetchLedgerStateRoot(props.blockHeight),
    fetchStateProof: () => http.fetchLedgerStateProof(props.blockHeight),
  })
);

const stateAgreement = computed(() =>
  evidenceResource.data ? stateEvidenceAgreement(evidenceResource.data, props.blockHeight) : null
);

const blockVerification = computed(() =>
  evidenceResource.data
    ? verifyTransactionBlockEvidence({
        blockProof: evidenceResource.data.blockProof,
        referenceBlock: evidenceResource.data.referenceBlock,
        requestedTransactionHash: props.transactionHash,
        requestedBlockHeight: props.blockHeight,
      })
    : null
);

type BlockVerificationClaim = 'verified' | 'failed' | 'incomplete';

const blockVerificationClaim = computed<BlockVerificationClaim | null>(() => {
  const verification = blockVerification.value;
  const evidence = evidenceResource.data;
  if (!verification || evidence?.blockProof.status !== 'available') return null;

  if (!verification.transactionHashMatches || !verification.proofHeightMatches) {
    return 'failed';
  }
  if (!verification.pathVerificationAvailable || evidence.referenceBlock.status !== 'available') return 'incomplete';
  return verification.valid ? 'verified' : 'failed';
});

const rawBlockProof = computed(() => {
  const part = evidenceResource.data?.blockProof;
  return part?.status === 'available' ? JSON.stringify(part.data.proof, null, 2) : '';
});

watch(
  () => [props.blockHeight, props.transactionHash] as const,
  ([height, hash], previous) => {
    if (!previous || (height === previous[0] && hash === previous[1])) return;
    evidenceResource.refetch();
  }
);
</script>

<template>
  <BaseContentBlock class="transaction-evidence" title="Transaction evidence">
    <template #header-action>
      <BaseButton
        bordered
        data-test="evidence-retry"
        :disabled="evidenceResource.isLoading"
        @click="evidenceResource.refetch()"
      >
        Refresh evidence
      </BaseButton>
    </template>

    <BaseResourceState
      :snapshot="evidenceResource.snapshot"
      loading-label="Loading ledger evidence"
      error-label="Ledger evidence could not be loaded"
      retry-label="Retry evidence"
      @retry="evidenceResource.refetch()"
    >
      <div v-if="evidenceResource.data" class="transaction-evidence__body">
        <p class="transaction-evidence__scope row-text">
          The decoded proof identity is compared with the requested transaction and reference-block metadata. This
          browser does not claim Merkle or finality verification: the current SDK requires a caller-authenticated
          anchor, and no digest-pinned browser finality-verifier WASM is shipped. State roots and quorum certificates
          are displayed exactly as this node supplied them; this browser does not verify their BLS aggregate signature.
        </p>

        <section class="transaction-evidence__section" aria-labelledby="transaction-evidence-merkle">
          <div class="transaction-evidence__heading">
            <h3 id="transaction-evidence-merkle">Block Merkle proof</h3>
            <span
              v-if="evidenceResource.data.blockProof.status === 'available'"
              class="transaction-evidence__claim"
              data-test="block-proof-claim"
              :class="
                blockVerificationClaim === 'verified'
                  ? 'transaction-evidence__claim--verified'
                  : blockVerificationClaim === 'failed'
                    ? 'transaction-evidence__claim--failed'
                    : 'transaction-evidence__claim--provided'
              "
            >
              {{
                blockVerificationClaim === 'verified'
                  ? 'Transaction entry locally verified'
                  : blockVerificationClaim === 'failed'
                    ? 'Local verification failed'
                    : 'Local verification incomplete'
              }}
            </span>
          </div>

          <div
            v-if="evidenceResource.data.blockProof.status === 'available'"
            class="transaction-evidence__grid"
            data-test="block-proof-available"
          >
            <DataField
              title="Entrypoint path"
              :value="
                evidenceResource.data.blockProof.data.pathVerification === null
                  ? 'Not authenticated in this browser'
                  : evidenceResource.data.blockProof.data.pathVerification.entry_hash_matches &&
                      evidenceResource.data.blockProof.data.pathVerification.entry_proof_valid
                    ? 'Verified against the authenticated anchor'
                    : 'Verification failed'
              "
            />
            <DataField
              title="Execution-result path"
              :value="
                evidenceResource.data.blockProof.data.pathVerification === null
                  ? 'Not authenticated in this browser'
                  : evidenceResource.data.blockProof.data.pathVerification.result_proof_valid
                    ? 'Verified against the authenticated anchor'
                    : 'Verification failed'
              "
            />
            <DataField
              title="Requested transaction"
              :value="blockVerification?.transactionHashMatches ? 'Matches proof entry' : 'Does not match proof entry'"
            />
            <DataField
              title="Proof block height"
              :value="
                blockVerification?.proofHeightMatches ? 'Matches requested height' : 'Does not match requested height'
              "
            />
            <DataField
              title="Reference block height"
              :value="
                evidenceResource.data.referenceBlock.status !== 'available'
                  ? 'Could not be checked'
                  : blockVerification?.referenceBlockHeightMatches
                    ? 'Matches requested height'
                    : 'Does not match requested height'
              "
            />
            <DataField
              title="Transactions root binding"
              :value="
                evidenceResource.data.referenceBlock.status !== 'available'
                  ? 'Could not be checked'
                  : blockVerification?.entryRootMatches
                    ? 'Matches reference block'
                    : 'Does not match reference block'
              "
            />
            <DataField
              title="Entrypoint commitment root"
              :hash="evidenceResource.data.blockProof.data.proof.entry_commitment.root"
              copy
            />
            <DataField
              title="Result commitment root"
              :hash="evidenceResource.data.blockProof.data.proof.result_commitment.root"
              copy
            />
          </div>
          <p
            v-else-if="evidenceResource.data.blockProof.status === 'unavailable'"
            class="transaction-evidence__message row-text"
            data-test="block-proof-unavailable"
          >
            This node has no block proof for the transaction entrypoint.
          </p>
          <p v-else class="transaction-evidence__message transaction-evidence__message--error row-text" role="alert">
            Block proof request failed: {{ evidenceResource.data.blockProof.problem.message }}
          </p>

          <div
            v-if="evidenceResource.data.referenceBlock.status === 'available'"
            class="transaction-evidence__grid transaction-evidence__reference"
            data-test="reference-block-available"
          >
            <DataField title="Reference block height" :value="evidenceResource.data.referenceBlock.data.height" />
            <DataField title="Reference block hash" :hash="evidenceResource.data.referenceBlock.data.hash" copy />
            <DataField
              title="Reference transactions root"
              :hash="evidenceResource.data.referenceBlock.data.transactions_hash ?? undefined"
              :value="evidenceResource.data.referenceBlock.data.transactions_hash ? undefined : 'No transactions root'"
              copy
            />
          </div>
          <p
            v-else-if="evidenceResource.data.referenceBlock.status === 'unavailable'"
            class="transaction-evidence__message row-text"
            data-test="reference-block-unavailable"
          >
            The reference block is unavailable, so this proof cannot be bound to block metadata.
          </p>
          <p
            v-else
            class="transaction-evidence__message transaction-evidence__message--error row-text"
            data-test="reference-block-error"
            role="alert"
          >
            Reference-block request failed: {{ evidenceResource.data.referenceBlock.problem.message }}
          </p>

          <details v-if="rawBlockProof">
            <summary>Canonical decoded proof</summary>
            <pre>{{ rawBlockProof }}</pre>
          </details>
        </section>

        <section class="transaction-evidence__section" aria-labelledby="transaction-evidence-state">
          <div class="transaction-evidence__heading">
            <h3 id="transaction-evidence-state">State root</h3>
            <span class="transaction-evidence__claim transaction-evidence__claim--provided">
              Node-provided · not cryptographically verified here
            </span>
          </div>
          <div v-if="evidenceResource.data.stateRoot.status === 'available'" class="transaction-evidence__grid">
            <DataField title="State root" :hash="evidenceResource.data.stateRoot.data.state_root" copy />
            <DataField title="Source" :value="evidenceResource.data.stateRoot.data.source" />
            <DataField title="Block hash" :hash="evidenceResource.data.stateRoot.data.block_hash" copy />
          </div>
          <p
            v-else-if="evidenceResource.data.stateRoot.status === 'unavailable'"
            class="transaction-evidence__message row-text"
          >
            This node has no state root at the transaction's block height.
          </p>
          <p v-else class="transaction-evidence__message transaction-evidence__message--error row-text" role="alert">
            State-root request failed: {{ evidenceResource.data.stateRoot.problem.message }}
          </p>
        </section>

        <section class="transaction-evidence__section" aria-labelledby="transaction-evidence-qc">
          <div class="transaction-evidence__heading">
            <h3 id="transaction-evidence-qc">Commit quorum certificate</h3>
            <span class="transaction-evidence__claim transaction-evidence__claim--provided">
              Node-provided · BLS not verified here
            </span>
          </div>
          <div
            v-if="evidenceResource.data.stateProof.status === 'available'"
            class="transaction-evidence__grid"
            data-test="state-proof-available"
          >
            <DataField title="Phase" :value="evidenceResource.data.stateProof.data.commit_qc.phase" />
            <DataField
              title="View / epoch"
              :value="`${evidenceResource.data.stateProof.data.commit_qc.view} / ${evidenceResource.data.stateProof.data.commit_qc.epoch}`"
            />
            <DataField
              title="Validator-set entries"
              :value="evidenceResource.data.stateProof.data.commit_qc.validator_set.length"
            />
            <DataField
              title="Signer bitmap"
              :hash="evidenceResource.data.stateProof.data.commit_qc.aggregate.signers_bitmap"
              copy
            />
            <DataField
              title="Validator-set hash"
              :hash="evidenceResource.data.stateProof.data.commit_qc.validator_set_hash"
              copy
            />
            <DataField
              title="Aggregate signature"
              :hash="evidenceResource.data.stateProof.data.commit_qc.aggregate.bls_aggregate_signature"
              copy
            />
          </div>
          <p
            v-else-if="evidenceResource.data.stateProof.status === 'unavailable'"
            class="transaction-evidence__message row-text"
            data-test="state-proof-unavailable"
          >
            No persisted commit quorum certificate is available from this node.
          </p>
          <p v-else class="transaction-evidence__message transaction-evidence__message--error row-text" role="alert">
            Quorum-certificate request failed: {{ evidenceResource.data.stateProof.problem.message }}
          </p>

          <p
            v-if="stateAgreement !== null"
            class="transaction-evidence__agreement row-text"
            :class="
              stateAgreement ? 'transaction-evidence__agreement--matching' : 'transaction-evidence__agreement--mismatch'
            "
            role="status"
          >
            {{
              stateAgreement
                ? 'The node-provided state-root and state-proof envelopes identify the requested block and have identical block hashes and state roots.'
                : 'Warning: the node-provided state-root and state-proof envelopes do not identify the same requested block and state root.'
            }}
          </p>
        </section>
      </div>
    </BaseResourceState>
  </BaseContentBlock>
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.transaction-evidence {
  &__body {
    display: flex;
    flex-direction: column;
    gap: size(3);
    padding: 0 size(4) size(3);
  }

  &__scope {
    max-width: 78ch;
    color: theme-color('content-secondary');
  }

  &__section {
    padding-block-start: size(3);
    border-block-start: 1px solid theme-color('border-primary');

    details {
      margin-block-start: size(3);
    }

    summary {
      cursor: pointer;
      color: theme-color('content-secondary');
    }

    pre {
      max-height: 28rem;
      overflow: auto;
      margin-block-start: size(2);
      padding: size(2);
      border: 1px solid theme-color('border-primary');
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font-size: 12px;
    }
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: size(2);
    margin-block-end: size(2);
  }

  &__claim {
    padding: size(0.5) size(1.5);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;

    &--verified {
      color: theme-color('success');
      background: color-mix(in srgb, theme-color('success') 14%, transparent);
    }

    &--failed {
      color: theme-color('error');
      background: color-mix(in srgb, theme-color('error') 14%, transparent);
    }

    &--provided {
      color: theme-color('warning');
      background: color-mix(in srgb, theme-color('warning') 14%, transparent);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: size(3);
  }

  &__reference {
    margin-block-start: size(3);
  }

  &__message {
    color: theme-color('content-secondary');

    &--error {
      color: theme-color('error');
    }
  }

  &__agreement {
    margin-block-start: size(3);

    &--matching {
      color: theme-color('success');
    }

    &--mismatch {
      color: theme-color('error');
    }
  }
}
</style>
