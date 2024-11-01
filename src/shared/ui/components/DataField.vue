<script setup lang="ts">
import BaseHash from '@/shared/ui/components/BaseHash.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseJson from '@/shared/ui/components/BaseJson.vue';
import ContextTooltip from '@/shared/ui/components/ContextTooltip.vue';

const props = withDefaults(
  defineProps<{
    title: string
    value?: string | number | Record<string, any> | null
    hash?: string
    link?: string
    copy?: boolean
    type?: 'full' | 'medium' | 'short' | 'two-line'
    metadata?: boolean
    tooltip?: string
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
    <div class="data-field__value">
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
      <BaseJson
        v-else-if="value && metadata"
        :value="value as Record<string, any>"
      />
      <span
        v-else
        class="row-text"
      >{{ props.value ?? $t('none') }}</span>
      <ContextTooltip
        v-if="tooltip"
        :message="tooltip"
      />
    </div>
  </div>
</template>

<style lang="scss">
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
    position: relative;
  }

  &__value span:hover ~ .context-tooltip {
    display: flex;
  }
}
</style>
