<template>
  <BaseContentBlock :title="$t('latestBlocks')" class="latest-blocks">
    <template #header-action>
      <BaseButton line>{{ $t('viewAll') }}</BaseButton>
    </template>

    <template #default>
      <template v-for="block in blocks" :key="block.height">
        <div class="latest-blocks__row">
          <BaseLink :to="`/blocks/${block.height}`">{{ block.height }}</BaseLink>

          <div class="latest-blocks__time">
            <TimeIcon />
            {{ $t('time.min', [elapsed.allMinutes(block.timestamp)]) }}
            {{ $t('time.sec', [elapsed.seconds(block.timestamp)]) }}
            {{ $t('time.ago') }}
          </div>

          <span class="latest-blocks__number">{{ block.transactions }} txns</span>
        </div>
      </template>
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseContentBlock from '~base/BaseContentBlock.vue';
import BaseButton from '~base/BaseButton.vue';
import BaseLink from '~base/BaseLink.vue';
import TimeIcon from '~icons/clock.svg';
import { http } from '~shared/api';
import { elapsed } from '~shared/lib/time';

const blocks = ref<BlockShallow[]>([]);

http.fetchBlocks({ page_size: 10, page: 1 })
  .then(res => (blocks.value = res.data));
</script>

<style lang="scss">
@import 'styles';

.latest-blocks {
  &__row {
    padding: size(1) size(2);
    border-bottom: 1px solid theme-color('border-primary');
    display: grid;
    grid-gap: size(1);
    grid-template-columns: 70px auto;
    justify-content: start;
    align-items: center;
    min-height: 64px;

    &:hover {
      box-shadow: theme-shadow('row');
      border-color: transparent;
    }

    & > * {
      width: fit-content;
    }

    @include xs {
      grid-template-columns: 70px auto 70px;
      justify-content: space-between;
    }

    @include sm {
      padding: 0 size(4);
    }
  }

  &__time {
    display: grid;
    grid-gap: size(1);
    grid-auto-flow: column;
    color: theme-color('content-primary');
    @include tpg-s3;
  }

  path {
    fill: theme-color('content-quaternary');
  }

  &__number {
    color: theme-color('content-primary');
    @include tpg-s3;
  }
}
</style>
