<template>
  <div class="base-inner-block">
    <div v-if="props.title" :class="headerClasses" @click="toggle">
      <h3 class="base-inner-block__title">{{ props.title }}</h3>
      <ArrowIcon v-if="props.accordion" :class="iconClasses" />
    </div>

    <slot v-if="isOpen" />
  </div>
</template>

<script setup lang="ts">
import ArrowIcon from '@/assets/svg/arrow.svg';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';

type Props = {
  accordion?: boolean,
  title?: string,
}

const props = defineProps<Props>();
const isOpen = ref(true);

const headerClasses = computed(() => ({
  'base-inner-block__header': true,
  'base-inner-block__header--clickable': props.accordion,
  'base-inner-block__header--open': isOpen.value,
}));

const iconClasses = computed(() => ({
  'base-inner-block__icon': true,
  'base-inner-block__icon--open': isOpen.value,
}));

function toggle() {
  if (props.accordion) {
    isOpen.value = !isOpen.value;
  }
}
</script>

<style lang="scss">
@import 'styles';

.base-inner-block {
  border-radius: size(4);
  background: theme-color('background');
  padding: size(3) size(4);
  margin: size(3) size(4);

  @include shadow-inner-block;

  &__header {
    display: flex;
    align-items: center;
    user-select: none;

    &--clickable {
      cursor: pointer;
    }

    &--open {
      margin-bottom: size(3);
    }
  }

  &__title {
    color: theme-color('content-primary');
    @include tpg-s2;
  }

  &__icon {
    margin-left: size(1);
    color: theme-color('content-primary');
    transform: rotate(-90deg);

    &--open {
      transform: rotate(90deg);
    }
  }
}
</style>
