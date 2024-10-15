<script setup lang="ts">
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import VueJsonPretty from 'vue-json-pretty';

const props = withDefaults(
  defineProps<{
    title: string
    value?: string | number | Record<string, any> | null
    hash?: string
    link?: string
    copy?: boolean
    type?: 'full' | 'medium' | 'short' | 'two-line'
    metadata?: boolean
  }>(),
  {
    type: 'full',
    metadata: false,
  }
);
</script>

<template>
  <div class="data-field">
    <span class="data-field__title h-sm">{{ title }}</span>
    <BaseHash
      v-if="hash"
      :hash
      :link
      :copy
      :type
      :class="{ 'row-text': !props.link }"
    />
    <BaseLink
      v-else-if="value && link"
      :to="link"
    >
      {{ value }}
    </BaseLink>
    <vue-json-pretty
      v-else-if="value && metadata"
      :height="Math.min(8, Object.keys(value).length + 2) * 20"
      class="row-text"
      :data="value"
      :deep="3"
      virtual
      collapsed-on-click-brackets
    />
    <span
      v-else
      class="data-field__value"
    >{{ props.value ?? $t('none') }}</span>
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';
@import 'vue-json-pretty/lib/styles.css';

.vjs-tree-node:hover {
  background: none;
}

.vjs-tree-brackets:hover {
  color: theme-color('primary-hover');
}

.vjs-value {
  color: theme-color('primary');
}

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
