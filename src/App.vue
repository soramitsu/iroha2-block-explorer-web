<template>
  <RouterView v-if="$route?.name === 'home'" />
  <AppPageLayout v-else>
    <RouterView />
  </AppPageLayout>
</template>

<script setup lang="ts">
import AppPageLayout from './components/AppPageLayout.vue';
</script>

<style lang="scss">
@import 'styles';

html {
  &:not(.dark) {
    @include light-theme;
  }

  &.dark {
    @include dark-theme;
  }
}

#app {
  background: theme-color('background');
}

* {
  box-sizing: border-box;
  margin: 0;
}

hr {
  border: none;
  height: 1px;
  background: theme-color('border-primary');
  box-shadow: theme-shadow('separator');
}

.content-row {
  padding: $size-2 $size-4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.content-row--with-hover:hover {
  box-shadow: theme-shadow('row');

  + hr {
    background: transparent;
    box-shadow: none;
  }
}

.primary-link {
  color: theme-color('primary');
  @include tpg-link1;

  &:hover {
    color: theme-color('primary-hover');
  }
}
</style>
