<template>
  <nav class="navigation-menu">
    <BaseButton
      v-for="(item, i) in translatedMenu"
      :key="i"
      :to="item.to"
      :class="{ 'base-button_active': item.names.includes(String(router.currentRoute.value.name)) }"
    >
      {{ item.label }}
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
import { menu } from '@/shared/config';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();

const translatedMenu = computed(() => menu.map((item) => ({ ...item, label: t(item.i18nKey) })));
</script>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.navigation-menu {
  display: none;
  grid-auto-flow: column;
  grid-template-columns: auto;
  align-items: center;
  grid-gap: size(1);

  @include lg {
    display: grid;
  }
}
</style>
