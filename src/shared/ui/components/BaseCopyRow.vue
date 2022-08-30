<template>
  <div class="base-copy-row">
    <slot />
    <CopyIcon class="base-copy-row__icon" @click="copy" />
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '~shared/ui/composables/notifications';
import CopyIcon from '~icons/copy.svg';

type Props = {
  value: string,
  name: string,
}

const props = defineProps<Props>();
const clipboard = useClipboard();
const noti = useNotifications();
const { t } = useI18n({ useScope: 'global' });

async function copy() {
  if (clipboard.isSupported) {
    await clipboard.copy(props.value);

    noti.success(t('clipboard.success', [props.name]));
  } else {
    noti.error(t('clipboard.error', [props.name.toLowerCase()]));
  }
}
</script>

<style lang="scss">
@import 'styles';

.base-copy-row {
  display: flex;
  align-items: center;

  &__icon {
    margin-left: size(1);
    cursor: pointer;
    color: theme-color('content-quaternary');

    &:hover {
      color: theme-color('content-tertiary');
    }
  }
}
</style>
