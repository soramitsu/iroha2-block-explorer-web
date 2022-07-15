<template>
  <BaseContentBlock :title="$t('latestBlocks')" class="latest-blocks">
    <template #header-action>
      <BaseButton line>{{ $t('viewAll') }}</BaseButton>
    </template>

    <template #default>
      <template v-for="(block, i) in blocks" :key="i">
        <div class="content-row content-row--with-hover">
          <a href="" class="primary-link">{{ block.height }}</a>

          <div class="latest-blocks__time">
            <div class="latest-blocks__time-item">
              <MinutesIcon />
              <span>{{ $t('time.minAgo', [elapsed.allMinutes(block.timestamp)]) }}</span>
            </div>

            <div class="latest-blocks__time-item">
              <SecondsIcon />
              <span>{{ $t('time.sec', [elapsed.seconds(block.timestamp)]) }}</span>
            </div>
          </div>

          <a href="" class="primary-link">{{ block.transactions }} txns</a>
        </div>

        <hr>
      </template>
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseButton from '@/components/BaseButton.vue';
import MinutesIcon from '@/icons/clock.svg';
import SecondsIcon from '@/icons/stopwatch.svg';
import { fetchBlocks } from '@/http';
import { ref } from 'vue';
import { elapsed } from '@/lib/time';

const blocks = ref<BlockShallow[]>([]);

fetchBlocks({ page_size: 11, page: 1 })
  .then(res => (blocks.value = res.data));
</script>

<style lang="scss">
@import 'styles';

.latest-blocks {
  &__time {
    display: grid;
    grid-gap: size(2);
    grid-auto-flow: column;
    @include tpg-s3;
    color: theme-color('content-primary');

    &-item {
      display: grid;
      grid-gap: size(1);
      grid-auto-flow: column;
    }
  }

  path {
    fill: theme-color('content-quaternary');
  }
}
</style>
