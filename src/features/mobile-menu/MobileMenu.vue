<template>
  <BaseButton
    :pressed="dropdown.isOpen.value"
    class="mobile-menu"
    aria-label="mobile menu"
    bordered
    rounded
    @click="dropdown.toggle"
  >
    <DotsIcon />
  </BaseButton>

  <Teleport
    v-if="dropdown.isOpen.value"
    :to="`#${PORTAL_ID}`"
  >
    <BaseDropdownWindow
      v-model="routeModel"
      size="lg"
      :items="links"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import DotsIcon from '@soramitsu-ui/icons/icomoon/basic-more-vertical-24.svg';
import { useMenuDropdown } from '@/shared/ui/composables/header-portal';
import { menu } from '@/shared/config';
import BaseDropdownWindow from '@/shared/ui/components/BaseDropdownWindow.vue';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import { useI18n } from 'vue-i18n';
import { PORTAL_ID } from '@/shared/ui/consts';

const { t } = useI18n();

const dropdown = useMenuDropdown();
const links = computed(() => menu.map((item) => ({ label: t(item.i18nKey), value: item.to })));
const router = useRouter();
const route = useRoute();

const routeModel = computed({
  get: () => route.path,
  set: (to) => {
    router.push(to);
    dropdown.toggle();
  },
});
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.mobile-menu {
  @include lg {
    display: none;
  }

  svg {
    margin: -4px;
    fill: theme-color('content-quaternary');
  }

  &:hover {
    svg {
      fill: theme-color('content-primary');
    }
  }

  // #SEARCH: return it when functionality is ready
  // &__search {
  //   margin: 8px;

  //   @include sm {
  //     display: none !important;
  //   }
  // }
}
</style>
