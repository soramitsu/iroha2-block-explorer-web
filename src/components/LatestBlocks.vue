<template>
  <BaseContentBlock title="Latest Blocks" class="latest-blocks">
    <template #header-action>
      <BaseButton line>view all</BaseButton>
    </template>

    <template #default>
      <template v-for="(block, i) in blocks" :key="i">
        <div class="content-row content-row--with-hover">
          <a href="" class="primary-link">{{ block.num }}</a>

          <div class="latest-blocks__time">
            <div class="latest-blocks__time-item">
              <MinutesIcon />
              <span>1 min ago</span>
            </div>

            <div class="latest-blocks__time-item">
              <SecondsIcon />
              <span>30 sec</span>
            </div>
          </div>

          <a href="" class="primary-link">{{ block.len }} txns</a>
        </div>

        <hr>
      </template>
    </template>
  </BaseContentBlock>
</template>

<script setup lang="ts">
import BaseContentBlock from '@/components/BaseContentBlock.vue';
import BaseButton from '@/components/BaseButton.vue';
import MinutesIcon from '@/assets/svg/clock.svg';
import SecondsIcon from '@/assets/svg/stopwatch.svg';

// type Props = {
//   blocks: CommittedBlock[];
// }

// const props = defineProps<Props>();

type FakeBlock = {
  num: number;
  len: number;
}

const blocks = new Array<FakeBlock>(10).fill({ num: 2312388, len: 143 });
</script>

<style lang="scss">
@import 'styles';

.latest-blocks {
  &__time {
    display: grid;
    grid-gap: $size-2;
    grid-auto-flow: column;
    @include tpg-s3;
    color: theme-color('content-primary');

    &-item {
      display: grid;
      grid-gap: $size-1;
      grid-auto-flow: column;
    }
  }

  path {
    fill: theme-color('content-quaternary');
  }
}
</style>
