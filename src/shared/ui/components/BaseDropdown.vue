<template>
  <div
    ref="target"
    class="base-dropdown"
    :style="`width: ${props.width}`"
  >
    <div class="base-dropdown__container">
      <div
        class="base-dropdown__field"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        aria-controls="popup_listbox"
        tabindex="0"
        @click="isOpen = !isOpen"
        @keydown.enter.space="isOpen = !isOpen"
      >
        <span class="base-dropdown__label">{{ fieldLabel }}&nbsp;</span>
        <span class="base-dropdown__value">{{ valueLabel }}</span>

        <ArrowIcon
          class="base-dropdown__icon"
          :style="`transform: rotate(${isOpen ? 0.5 : 0}turn);`"
        />
      </div>

      <ul
        v-if="isOpen"
        id="popup_listbox"
        class="base-dropdown__list"
        role="listbox"
      >
        <li
          v-for="(item, i) in items"
          :key="i"
          role="option"
          tabindex="0"
          :aria-selected="props.modelValue === item.value || false"
          :data-active="props.modelValue === item.value || null"
          class="base-dropdown__item"
          @click="choose(item.value)"
          @keydown.enter.space="choose(item.value)"
        >
          {{ item.label }}
        </li>
      </ul>
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
    padding: 0 0 size(1) 0;
  }

  &__value {
    @include tpg-h4;
    margin-right: auto;
  }

  &__item {
    padding: size(0.5) size(2);
    list-style: none;

    &:hover {
      background: theme-color('background-hover');
    }

    &[data-active] {
      background: theme-color('background-hover');
      cursor: default;
    }
  }
}
</style>
