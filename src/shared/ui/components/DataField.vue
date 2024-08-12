<script setup lang="ts">
import BaseHash from '@/shared/ui/components/BaseHash.vue';

const props = defineProps<{
  title: string
  value?: string | number
  bold?: boolean
  hash?: string
  link?: string
  copy?: boolean
}>();
</script>

<template>
  <div class="data-field">
    <span class="data-field__title h-sm">{{ title }}</span>
    <BaseHash
      v-if="hash"
      :hash="hash"
      :link="link"
      :copy="copy"
      type="full"
      :class="{ 'row-text': !props.link }"
    />
    <span
      v-else-if="value"
      class="data-field__value"
      :class="{ 'data-field__value_bold': props.bold }"
    >{{
      props.value
    }}</span>
  </div>
</template>

<style scoped lang="scss">
@import '@/shared/ui/styles/main';

.data-field {
  color: theme-color('content-primary');
  display: flex;
  justify-content: left;
  flex-direction: column;

  &__title {
    margin-bottom: size(1);
  }

  &__value {
    @include tpg-s3();

    &_bold {
      @include xs {
        @include tpg-s1();
        font-weight: 300;
      }

      @include md {
        @include tpg-s1();
        font-weight: 600;
      }
    }
  }
}
</style>
