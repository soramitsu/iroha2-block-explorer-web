<template>
  <label
    :class="`search-field search-field--${props.large ? 'large' : 'normal' }`"
  >
    <SearchIcon class="search-field__icon" />

    <input
      v-model="request"
      type="search"
      :placeholder="props.placeholder"
      class="search-field__input"
      @keyup.enter="submit"
    >
  </label>
</template>

<script setup lang="ts">
import SearchIcon from '@soramitsu-ui/icons/icomoon/basic-search-24.svg';
import { ref } from 'vue';

type Props = {
  large?: boolean,
  placeholder?: string,
}

const props = defineProps<Props>();

const request = ref('');

function submit() {
  console.log('submit', request.value);
}
</script>

<style lang="scss">
@import 'styles';

.search-field {
  display: flex;
  align-items: center;

  input {
    color: theme-color('content-primary');;
    background: transparent;
    border: none;

    &:focus {
      outline: none;
    }

    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
      height: 0;
      width: 0;
      opacity: 0;
      pointer-events: none;
    }
  }

  path {
    fill: theme-color('border-secondary');
  }

  &--large {
    height: 88px;
    padding: 0 28px;
    border-radius: 44px;
    width: 408px;

    @include shadow-search;
    @include tpg-s2;

    svg {
      margin-right: $size-2;
    }
  }

  &--normal {
    height: $size-6;
    padding: $size-0 $size-2;
    border-radius: $size-3;
    width: 408px;

    @include shadow-lowered-1;
    @include tpg-s3;

    svg {
      margin-right: $size-1;
    }
  }
}
</style>
