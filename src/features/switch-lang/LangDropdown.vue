<template>
  <BaseButton
    class="lang-dropdown__button"
    bordered
    aria-label="lang dropdown"
    :pressed="dropdown.isOpen.value"
    role="combobox"
    aria-autocomplete="list"
    aria-haspopup="listbox"
    :aria-expanded="dropdown.isOpen.value"
    aria-controls="window_listbox"
    @click="dropdown.toggle"
  >
    <LangIcon class="lang-dropdown__lang-icon" />
    <span class="lang-dropdown__code">{{ language }}</span>
    <ArrowIcon
      class="lang-dropdown__arrow-icon"
      :style="{ transform: `rotate(${arrowIconRotateValue}turn)` }"
    />
  </BaseButton>

  <Teleport
    v-if="dropdown.isOpen.value"
    :to="`#${PORTAL_ID}`"
  >
    <BaseDropdownWindow
      v-model:model-value="language"
      :items="langOptions"
      size="lg"
      @update:model-value="dropdown.toggle()"
    />
  </Teleport>
</template>

<script setup lang="ts">
import LangIcon from '@/shared/ui/icons/lang.svg';
import ArrowIcon from '@/shared/ui/icons/arrow.svg';
import { useLangDropdown } from '@/shared/ui/composables/header-portal';
import BaseDropdownWindow from '@/shared/ui/components/BaseDropdownWindow.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import { langOptions } from '@/shared/config';
import { useApplicationLanguage } from '@/shared/ui/composables/useApplicationLanguage';
import { PORTAL_ID } from '@/shared/ui/consts';
import { computed } from 'vue';

const dropdown = useLangDropdown();

const { language } = useApplicationLanguage();

const arrowIconRotateValue = computed(() => (dropdown.isOpen.value ? 0.75 : 0.25));
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

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
