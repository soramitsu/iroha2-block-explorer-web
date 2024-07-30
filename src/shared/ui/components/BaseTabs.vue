<template>
  <div class="base-tabs">
    <div
      v-if="adaptiveOptions && adaptiveIndexStart !== 0"
      class="base-tabs__arrow"
      @click="handleArrowPrevClick"
    >
      <ArrowIcon />
    </div>

    <div
      v-for="(item, i) in adaptiveOptions"
      :key="i"
      class="base-tabs__tab"
      :class="{ 'base-tabs__tab--active': item.value === model }"
      @click="model = item.value"
    >
      {{ item.label }}
    </div>

    <div
      v-if="adaptiveOptions && adaptiveIndexEnd !== props.items.length"
      class="base-tabs__arrow"
      @click="handleArrowNextClick"
    >
      <ArrowIcon />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModel, useWindowSize } from '@vueuse/core';
import { computed, ref, watchSyncEffect } from 'vue';
import type { AdaptiveOptions } from '@/shared/ui/utils/adaptive-options';
import { applyAdaptiveOptions } from '@/shared/ui/utils/adaptive-options';
import ArrowIcon from '@soramitsu-ui/icons/icomoon/arrows-chevron-left-rounded-24.svg';

interface TabItem {
  label: string
  value: string
}

interface Props {
  items: TabItem[]
  modelValue: string
  adaptiveOptions?: AdaptiveOptions
}

type Emits = (e: 'update:modelValue', value: string) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { width } = useWindowSize();

const adaptiveIndexStart = ref(0);
const adaptiveIndexEnd = ref(0);

const adaptiveOptions = computed(() => {
  return props.items.slice(adaptiveIndexStart.value, adaptiveIndexEnd.value);
});

function handleArrowNextClick() {
  let diff;

  if (adaptiveIndexEnd.value === 2) {
    diff = 2;
  } else diff = props.items.length - adaptiveIndexEnd.value;

  adaptiveIndexStart.value += diff;
  adaptiveIndexEnd.value += diff;
}

function handleArrowPrevClick() {
  let diff;

  if (adaptiveIndexStart.value === 4) {
    diff = 2;
  } else diff = adaptiveIndexStart.value;

  adaptiveIndexStart.value -= diff;
  adaptiveIndexEnd.value -= diff;
}

watchSyncEffect(() => {
  adaptiveIndexEnd.value = applyAdaptiveOptions(width.value, props.adaptiveOptions ?? props.items.length);
});

const model = useVModel(props, 'modelValue', emit);
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.base-tabs {
  display: grid;
  grid-gap: size(0.5);
  grid-auto-flow: column;
  width: fit-content;
  align-items: center;
  padding: size(0.5);
  border-radius: size(2);
  background: theme-color('background');

  @include shadow-input;

  &__arrow {
    border-radius: 50%;
    color: theme-color('content-on-surface-variant');
    background: theme-color('content-quaternary');
    width: size(2);
    height: size(2);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin-left: 4px;
    cursor: pointer;

    &:last-child {
      transform: rotateY(180deg);
      margin-right: 4px;
    }

    svg {
      fill: theme-color('content-on-surface-variant');
      width: size(2);
      height: size(2);
    }
  }

  &__tab {
    padding: size(0.5) size(1);
    border-radius: size(1.5);
    @include tpg-s4;
    cursor: pointer;
    user-select: none;
    transition: all 300ms ease-in-out;
    color: theme-color('content-quaternary');

    &:hover {
      background: theme-color('background-hover');
    }

    &--active {
      background: theme-color('content-quaternary');
      color: theme-color('content-on-surface-variant');

      &:hover {
        background: theme-color('content-quaternary');
      }
    }
  }
}
</style>
