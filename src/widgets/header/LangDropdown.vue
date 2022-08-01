<template>
  <BaseButton
    class="lang-dropdown__button"
    bordered
    :pressed="dropdown.isOpen.value"
    @click="dropdown.toggle"
  >
    <LangIcon class="lang-dropdown__lang-icon" />
    <span class="lang-dropdown__code">{{ value }}</span>
    <ArrowIcon class="lang-dropdown__arrow-icon" />
  </BaseButton>

  <Teleport v-if="dropdown.isOpen.value" to="#header-dropdown-portal">
    <BaseDropdownWindow
      v-model:value="value"
      :items="langs"
      size="lg"
      @update:value="dropdown.toggle"
    />
  </Teleport>
</template>

<script setup lang="ts">
import BaseButton from '~base/BaseButton.vue';
import BaseDropdownWindow from '~base/BaseDropdownWindow.vue';
import LangIcon from '~icons/lang.svg';
import ArrowIcon from '~icons/arrow.svg';
import { useLangDropdown } from './header-dropdowns';
import { ref } from 'vue';

const dropdown = useLangDropdown();

const langs = [
  { label: 'EN - English', value: 'en' },
  { label: 'FR - Français', value: 'fr' },
  { label: 'ES - Español', value: 'es' },
  { label: 'DE - Deutsch', value: 'de' },
  { label: 'RU - Русский', value: 'ru' },
  { label: 'JP - 日本', value: 'jp' },
];

const value = ref('en');
</script>

<style lang="scss">
@import 'styles';

.lang-dropdown {
  &__button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: size(1.5);

    @include md {
      padding: size(1.5) size(2);
    }
  }

  &__lang-icon {
    width: size(2);
    height: size(2);
  }

  &__arrow-icon {
    width: size(1);
    height: size(1);
    margin-left: size(0.5);
    transform: rotateZ(90deg);

    display: none;

    @include md {
      display: block;
    }
  }

  &__code {
    display: none;
    margin-left: size(1);
    text-transform: uppercase;

    @include md {
      display: block;
    }
  }
}
</style>
