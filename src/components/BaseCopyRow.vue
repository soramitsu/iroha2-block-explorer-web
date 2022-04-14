<template>
  <div class="base-copy-row">
    <slot />
    <CopyIcon class="base-copy-row__icon" @click="copy" />
  </div>
</template>

<script setup lang="ts">
import CopyIcon from '@/assets/svg/copy.svg';
import { useNotifications } from '@/composables/notifications';
import { useClipboard } from '@vueuse/core';

type Props = {
  value: string,
  name: string,
}

const props = defineProps<Props>();
const clipboard = useClipboard();
const noti = useNotifications();

function copy() {
  if (clipboard.isSupported) {
    clipboard.copy(props.value);

    noti.success(`${props.name} copied to clipboard`);
  } else {
    noti.error(`Impossible copy ${props.name.toLowerCase()} to clipboard`);
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
