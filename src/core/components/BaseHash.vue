<template>
  <div class="base-hash">
    <BaseLink
      :to="props.link"
      monospace
    >
      <span v-if="props.type === 'two-line'"> {{ content[0] }}<br>{{ content[1] }}</span>
      <span v-else>{{ content }}</span>
    </BaseLink>

    <CopyIcon
      v-if="props.copy"
      class="base-hash__copy"
      @click="copy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CopyIcon from '@/core/assets/copy.svg';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '@/core/composables/useNotifications';
import BaseLink from '@/core/components/BaseLink.vue';

const props = defineProps<{
  hash: string
  link: string
  copy?: boolean
  type?: 'full' | 'medium' | 'short' | 'two-line'
}>();
const clipboard = useClipboard();
const notifications = useNotifications();
const { t } = useI18n({ useScope: 'global' });

async function copy() {
  if (clipboard.isSupported) {
    await clipboard.copy(props.hash);
    notifications.success(t('clipboard.success'));
  } else {
    notifications.error(t('clipboard.error'));
  }
}

const content = computed(() => {
  if (props.type === 'short') return props.hash.slice(0, 4) + '...' + props.hash.slice(-4);
  else if (props.type === 'medium') return props.hash.slice(0, 10) + '...' + props.hash.slice(-10);
  else if (props.type === 'two-line') {
    const center = Math.ceil(props.hash.length / 2);

    return [props.hash.slice(0, center), props.hash.slice(-center + (props.hash.length % 2))];
  }

  return props.hash;
});
</script>

<style lang="scss">
@import '@/styles/main';

.base-hash {
  display: flex;
  align-items: center;

  &__copy {
    margin-left: size(1);
    cursor: pointer;
    color: theme-color('content-quaternary');

    &:hover {
      color: theme-color('content-tertiary');
    }
  }
}
</style>
