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
      role="button"
      tabindex="0"
      class="base-hash__copy"
      @click.stop="copyHash"
      @keydown.enter.space.stop="copyHash"
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
import type { HashType } from '@/shared/ui/composables/useAdaptiveHash';

interface Props {
  hash: string
  link?: string
  copy?: boolean
  type: HashType
}

const props = defineProps<Props>();
const clipboard = useClipboard();
const notifications = useNotifications();
const { t } = useI18n({ useScope: 'global' });

async function copyHash() {
  if (clipboard.isSupported) {
    await clipboard.copy(props.hash);
    notifications.success(t('clipboard.success'));
  } else {
    notifications.error(t('clipboard.error'));
  }
}

type Content = { t: 'plain', value: string } | { t: 'two-line', first: string, second: string };

function shortenHash(str: string, n: number) {
  const [authority, domain] = str.split('@');

  const shortenAuthority = authority.slice(0, n) + '...' + authority.slice(-n);

  if (!domain) return shortenAuthority;

  return shortenAuthority + '@' + domain;
}

const content = computed<Content>(() => {
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
        value: shortenHash(props.hash, 4),
      };
    }
    case 'medium': {
      return {
        t: 'plain',
        value: shortenHash(props.hash, 10),
      };
    }
    case 'two-line': {
      const [authority, domain] = shortenHash(props.hash, 4).split('@');

      return {
        t: 'two-line',
        first: authority,
        second: domain ? `@${domain}` : '',
      };
    }
    default: {
      const x: never = props.type;
      throw new Error(`Unexpected props.type: ${String(x)}`);
    }
  }
});
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.base-hash {
  display: flex;
  align-items: center;
  word-break: break-all;

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
