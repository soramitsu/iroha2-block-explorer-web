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
      v-model:model-value="language"
      :items="langOptions"
      size="lg"
      @update:model-value="updateLanguage"
    />
  </Teleport>
</template>

<script setup lang="ts">
import LangIcon from '@/shared/ui/icons/lang.svg';
import ArrowIcon from '@/shared/ui/icons/arrow.svg';
import { useLangDropdown } from '@/shared/ui/composables/header-portal';
import BaseDropdownWindow from '@/shared/ui/components/BaseDropdownWindow.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import { watch } from 'vue';
import { langOptions, PORTAL_ID } from '@/shared/config';
import { useApplicationLanguage } from '@/shared/ui/composables/useApplicationLanguage';
import { useI18n } from 'vue-i18n';

const dropdown = useLangDropdown();

const { language, setApplicationCurrency } = useApplicationLanguage();

function updateLanguage(value: string) {
  if (dropdown.isOpen.value) dropdown.toggle();

  setApplicationCurrency(value);
}

const { locale } = useI18n();

watch(language, () => {
  locale.value = language.value;
});
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
