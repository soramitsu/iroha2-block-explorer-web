<template>
  <BaseButton
    :pressed="dropdown.isOpen.value"
    class="mobile-menu"
    bordered
    rounded
    @click="dropdown.toggle"
  >
    <DotsIcon />
  </BaseButton>

  <Teleport v-if="dropdown.isOpen.value" :to="`#${PORTAL_ID}`">
    <BaseDropdownWindow
      size="lg"
      :items="links"
      :value="route.path"
      @update:value="choice"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import DotsIcon from '@soramitsu-ui/icons/icomoon/basic-more-vertical-24.svg';
import BaseButton from '~base/BaseButton.vue';
import BaseDropdownWindow from '~base/BaseDropdownWindow.vue';
import { menu, PORTAL_ID } from '~shared/config';
import { useMenuDropdown } from '~shared/model/header-portal';

const dropdown = useMenuDropdown();
const links = computed(() => menu.map(item => ({ label: item.label, value: item.to })));
const router = useRouter();
const route = useRoute();

function choice(to: string) {
  router.push(to);
  dropdown.toggle();
}
</script>

<style lang="scss">
@import 'styles';

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
