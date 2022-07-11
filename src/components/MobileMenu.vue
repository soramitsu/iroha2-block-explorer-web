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

  <Teleport v-if="dropdown.isOpen.value" to="#header-dropdown-portal">
    <BaseDropdownWindow
      size="lg"
      :items="links"
      :value="route.path"
      @update:value="choice"
    >
      <template #top>
        <SearchField class="mobile-menu__search" size="sm" :placeholder="$t('search')" />
      </template>
    </BaseDropdownWindow>
  </Teleport>
</template>

<script setup lang="ts">
import DotsIcon from '@soramitsu-ui/icons/icomoon/basic-more-vertical-24.svg';
import BaseButton from './BaseButton.vue';
import BaseDropdownWindow from './BaseDropdownWindow.vue';
import SearchField from './SearchField.vue';
import { useMenuDropdown } from '@/composables/header-dropdowns';
import { menu } from '@/constants';
import { useRoute, useRouter } from 'vue-router';

const dropdown = useMenuDropdown();
const links = menu.map(item => ({ label: item.label, value: item.to }));
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

  &__search {
    margin: 8px;

    @include sm {
      display: none !important;
    }
  }
}
</style>
