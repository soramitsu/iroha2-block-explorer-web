<template>
  <div class="base-hash">
    <BaseLink
      v-if="props.link"
      :to="props.link"
      monospace
    >
      <span v-if="content.t === 'two-line'">{{ content.first }}<br>{{ content.second }}</span>
      <span v-else>{{ content.value }}</span>
    </BaseLink>

    <span v-else-if="content.t === 'two-line'">{{ content.first }}<br>{{ content.second }}</span>
    <span v-else>{{ content.value }}</span>

    <CopyIcon
      v-if="props.copy"
      class="base-hash__copy"
      @click="copy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CopyIcon from '@/shared/ui/icons/copy.svg';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '@/shared/ui/composables/notifications';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import { assertUnreachable } from '@/shared/ui/utils/assert-unreachable';

interface Props {
  hash: string
  link?: string
  copy?: boolean
  type?: 'full' | 'medium' | 'short' | 'two-line'
}

const props = defineProps<Props>();
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

type Content = { t: 'plain', value: string } | { t: 'two-line', first: string, second: string };

const content = computed<Content | never>(() => {
  switch (props.type) {
    case 'full': {
      return {
        t: 'plain',
        value: props.hash,
      };
    }
    case 'short': {
      return {
        t: 'plain',
        value: props.hash.slice(0, 4) + '...' + props.hash.slice(-4),
      };
    }
    case 'medium': {
      return {
        t: 'plain',
        value: props.hash.slice(0, 10) + '...' + props.hash.slice(-10),
      };
    }
    case 'two-line': {
      const center = Math.ceil(props.hash.length / 2);

      return {
        t: 'two-line',
        first: props.hash.slice(0, center),
        second: props.hash.slice(-center + (props.hash.length % 2)),
      };
    }
    default: {
      return assertUnreachable('Wrong type');
    }
  }
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
