<template>
  <label
    class="search-field"
    :data-size="props.large ? 'large' : 'normal'"
    :data-focused="isFocused || null"
  >
    <SearchIcon class="search-field__icon" />

    <input
      :id="id"
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
import { useActiveElement } from '@vueuse/core';
import { computed } from '@vue/reactivity';

type Props = {
  large?: boolean,
  placeholder?: string,
}

const props = defineProps<Props>();

const request = ref('');

const id = 'search-field';
const activeElement = useActiveElement();
const isFocused = computed(() => activeElement.value?.id === id);

function submit() {
  console.log('submit', request.value);
}
</script>

<style lang="scss">
@import 'styles';

.search-field {
  display: flex;
  align-items: center;
  transition: color 300ms ease-in-out, box-shadow 300ms ease-in-out;

  input {
    color: theme-color('content-primary');;
    background: transparent;
    border: none;
    width: 100%;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: theme-color('content-primary');
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

  &[data-size="large"] {
    height: 88px;
    padding: 0 28px;
    border-radius: 44px;
    width: $home-content-width;
    background: theme-color('surface');

    @include shadow-large-input;

    &:hover {
      @include shadow-large-input-active;
    }

    &[data-focused] {
      @include shadow-large-input-active;
    }

    input {
      @include tpg-s2;
    }

    svg {
      margin-right: size(2);
      height: size(4);
      width: size(4);
    }
  }

  &[data-size="normal"] {
    height: size(6);
    padding: 0 size(2);
    border-radius: size(3);
    width: 408px;

    @include shadow-input;

    &:hover {
      @include shadow-input-active;
    }

    &[data-focused] {
      @include shadow-input-active;
    }

    input {
      @include tpg-s3;
    }

    svg {
      margin-right: size(1);
    }
  }
}
</style>
