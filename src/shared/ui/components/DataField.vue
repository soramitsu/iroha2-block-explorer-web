<script setup lang="ts">
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';

const props = withDefaults(
  defineProps<{
    title: string
    value?: string | number | Record<string, any> | null
    hash?: string
    link?: string
    copy?: boolean
    type?: 'full' | 'medium' | 'short' | 'two-line'
  }>(),
  {
    type: 'full',
  }
);
</script>

<template>
  <div class="data-field">
    <span class="data-field__title h-sm">{{ title }}</span>
    <BaseHash
      v-if="hash"
      :hash="hash"
      :link="link"
      :copy="copy"
      :type="type"
      :class="{ 'row-text': !props.link }"
    />
    <BaseLink
      v-else-if="value && link"
      :to="link"
    >
      {{ value }}
    </BaseLink>
    <span
      v-else
      class="data-field__value"
    >{{ props.value ?? $t('none') }}</span>
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
  }
}
</style>
