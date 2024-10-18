<template>
  <div
    ref="target"
    class="base-dropdown"
    :style="`width: ${props.width}`"
  >
    <div class="base-dropdown__container">
      <div
        class="base-dropdown__field"
        @click="isOpen = !isOpen"
      >
        <span class="base-dropdown__label">{{ fieldLabel }}&nbsp;</span>
        <span class="base-dropdown__value">{{ valueLabel }}</span>

        <ArrowIcon
          class="base-dropdown__icon"
          :style="`transform: rotate(${isOpen ? 0.5 : 0}turn);`"
        />
      </div>

      <div
        v-if="isOpen"
        class="base-dropdown__list"
      >
        <div
          v-for="(item, i) in items"
          :key="i"
          class="base-dropdown__item"
          @click="choose(item.value)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ArrowIcon from '@/shared/ui/icons/dropdown-icon.svg';
import { onClickOutside } from '@vueuse/core';

interface DropdownItem {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  items: DropdownItem[]
  fieldLabel: string
  width: string
}

type Emits = (e: 'update:modelValue', value: string | number) => void;

const target = ref(null);

onClickOutside(target, () => {
  isOpen.value = false;
});

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const valueLabel = computed(() => props.items.find((item) => item.value === props.modelValue)?.label ?? '');

function choose(value: string | number) {
  emit('update:modelValue', value);
  isOpen.value = false;
}
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

.base-dropdown {
  position: relative;
  height: size(4);

  &__container {
    position: relative;
    z-index: 10;
    background: theme-color('background');
    color: theme-color('content-quaternary');
    fill: theme-color('content-quaternary');
    border-radius: size(2);
    overflow: hidden;
    user-select: none;
    cursor: pointer;

    @include tpg-s4;
    @include shadow-input;
  }

  &__icon {
    width: 16px;
    height: 16px;
    color: theme-color('content-quaternary');
  }

  &__field {
    display: flex;
    padding: size(1) size(1) size(1) size(2);
  }

  &__list {
    padding-bottom: size(1);
  }

  &__value {
    @include tpg-h4;
    margin-right: auto;
  }

  &__item {
    padding: size(0.5) size(2);

    &:hover {
      background: theme-color('background-hover');
    }
  }
}
</style>
