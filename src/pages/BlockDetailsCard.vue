<script setup lang="ts">
import BaseLink from "~base/BaseLink.vue";
import BaseHash from "~base/BaseHash.vue";

const props = defineProps<{
  blockNumber: number,
  hash: string,
  parent_block_hash: string
  merkle_root_hash: string
  rejected_merkle_root_hash: string
  view_change_proofs: number
  invalidated_block_hashes: number
}>()
</script>

<template>
  <div class="block-details-card__body">
    <div class="block-details-card__column">
      <div class="block-details-card__column__row">
              <span class="h-sm cell">{{
                  `${$t("block", 1)} ${$t("hash")}`
                }}</span>
        <BaseHash
            :hash="block.block_hash"
            :link="`/blocks/${block.height}`"
            :type="hashType"
            copy
            class="block-details-card__column__row__hash"
        />
      </div>
      <div class="block-details-card__column__row">
              <span class="h-sm cell">{{
                  $t('blockDetails.transactionMerkleRootHash')
                }}</span>
        <BaseHash
            :hash="block.transactions_merkle_root_hash"
            :link="`/blocks/${block.height}`"
            :type="hashType"
            copy
            class="block-details-card__column__row__hash"
        />
      </div>
      <div class="blocks-details-card__column__row">
        <BaseLink
            :to="`/blocks/${block.height}`"
            class="block-details-card__column__row__hashFrame"
        >
          <!-- TODO wait for design to specify what should happen on click"-->
          {{
            $t("blockDetails.viewChangeProofs", {
              length: block.view_change_proofs.length,
            })
          }}
        </BaseLink>
      </div>
    </div>
    <div class="block-details-card__column">
      <div class="block-details-card__column__row">
              <span class="h-sm cell">{{
                  $t("blockDetails.parent") +
                  " " +
                  $t("block", 1) +
                  " " +
                  $t("hash")
                }}</span>
        <BaseHash
            :hash="block.parent_block_hash"
            :link="`/blocks/${block.height}`"
            :type="hashType"
            copy
            class="block-details-card__column__row__hashFrame"
        />
      </div>
      <div class="block-details-card__column__row">
              <span class="h-sm cell">{{
                  $t('blockDetails.rejectedTransactionMerkleRootHash')
                }}</span>
        <BaseHash
            :hash="block.rejected_transactions_merkle_root_hash"
            :link="`/blocks/${block.height}`"
            :type="hashType"
            copy
            class="block-details-card__column__row__hash"
        />
      </div>
      <div class="blocks-details-card__row">
        <BaseLink
            :to="`/blocks/${block.height}`"
            data-testid="hash-frame"
            class="block-details-card__column__row__hashFrame"
        >
          <!-- TODO wait for design to specify what should happen on click"-->
          {{ $t("blockDetails.invalidatedTransactionHash",{length: block.invalidated_blocks_hashes.length}) }}
        </BaseLink>
      </div>
    </div>
  </div>

</template>

<style scoped lang="scss">

</style>