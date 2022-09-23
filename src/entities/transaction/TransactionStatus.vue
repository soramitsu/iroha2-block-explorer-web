<template>
  <div class="transaction-status">
    <div class="transaction-status__icon" :data-committed="committed">
      <SuccessIcon v-if="committed" />
      <ErrorIcon v-else />
    </div>

    <div v-if="type === 'label'" class="transaction-status__label" :data-committed="committed">
      <span v-if="committed">Committed</span>
      <span v-else>Rejected</span>
    </div>

    <div v-if="type === 'tooltip'" class="transaction-status__tooltip">
      <span v-if="committed">Committed transaction</span>
      <span v-else>Rejected transaction</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import SuccessIcon from '~icons/success.svg';
import ErrorIcon from '~icons/error.svg';

type Props = {
  committed: boolean,
  type: 'label' | 'tooltip'
}

defineProps<Props>();
</script>

<style lang="scss">
@import 'styles';

.transaction-status {
  position: relative;
  display: grid;
  grid-gap: size(1);
  align-items: center;
  grid-auto-flow: column;
  grid-auto-columns: auto;

  &:hover .transaction-status__tooltip {
    display: flex;
  }

  &__icon {
    width: size(4);
    height: size(4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 14px;
      height: 14px;
    }

    &[data-committed=true] {
      background: theme-color('success-background');
      color: theme-color('success');
    }

    &[data-committed=false] {
      background: theme-color('error-background');
      color: theme-color('error');
    }
  }

  &__tooltip {
    display: none;
    background-color: theme-color('content-primary');
    color: theme-color('content-on-background-inverted');
    position: absolute;
    left: 0;
    bottom: size(-5);
    padding: size(1.5) size(2);
    border-radius: size(0.5);
    white-space: nowrap;
    z-index: 1;

    @include tpg-s4;
  }

  &__label {
    @include tpg-h3;

    &[data-committed=true] {
      color: theme-color('success');
    }

    &[data-committed=false] {
      color: theme-color('error');
    }
  }
}
</style>
