<template>
  <div class="base-hash">
    <RouterLink v-if="props.link" :to="props.link" class="primary-link">
      <HashRow />
    </RouterLink>

    <HashRow v-else />

    <CopyIcon v-if="props.copy" class="base-hash__copy" @click="copy" />
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '~shared/ui/composables/notifications';
import CopyIcon from '~icons/copy.svg';

type Props = {
  hash: string,
  link?: string,
  copy?: boolean,
  type?: 'full' | 'medium' | 'short' | 'two-line',
}

const props = defineProps<Props>();
const clipboard = useClipboard();
const noti = useNotifications();
const { t } = useI18n({ useScope: 'global' });

async function copy() {
  if (clipboard.isSupported) {
    await clipboard.copy(props.hash);
    noti.success(t('clipboard.success'));
  } else {
    noti.error(t('clipboard.error'));
  }
}

function getHashContent() {
  switch (props.type) {
    case 'short':
      return props.hash.slice(0, 4) + '...' + props.hash.slice(-4);
    case 'medium':
      return props.hash.slice(0, 10) + '...' + props.hash.slice(-10);
    case 'two-line':
      // eslint-disable-next-line no-case-declarations
      const center = Math.ceil(props.hash.length / 2);

      return [
        props.hash.slice(0, center),
        h('br'),
        props.hash.slice(1 - center),
      ];

    default:
      return props.hash;
  }
}

const HashRow = h('span', getHashContent());
</script>

<style lang="scss">
@import 'styles';

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
