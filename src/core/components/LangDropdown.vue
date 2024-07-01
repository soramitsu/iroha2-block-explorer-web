<template>
  <BaseButton
    class="lang-dropdown__button"
    bordered
    :pressed="dropdown.isOpen.value"
    @click="dropdown.toggle"
  >
    <LangIcon class="lang-dropdown__lang-icon" />
    <span class="lang-dropdown__code">{{ language }}</span>
    <ArrowIcon class="lang-dropdown__arrow-icon" />
  </BaseButton>

  <Teleport
    v-if="dropdown.isOpen.value"
    :to="`#${PORTAL_ID}`"
  >
    <BaseDropdownWindow
      v-model="language"
      :items="[...LANG_OPTIONS]"
      size="lg"
      disable-translation
      @update:model-value="dropdown.toggle"
    />
  </Teleport>
</template>

<script setup lang="ts">
import LangIcon from '@/core/assets/lang.svg';
import ArrowIcon from '@/core/assets/arrow.svg';
import { ref } from 'vue';
import { useLangDropdown } from '@/core/composables/header-portal';
import BaseDropdownWindow from '@/core/components/BaseDropdownWindow.vue';
import BaseButton from '@/core/components/BaseButton.vue';
import { LANG_OPTIONS, PORTAL_ID } from '@/core/consts';

const dropdown = useLangDropdown();

const language = ref('en');
</script>

<style lang="scss">
@import '@/styles/main';

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
