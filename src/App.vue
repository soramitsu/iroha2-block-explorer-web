<template>
  <div class="app">
    <RouterView v-if="$route?.name === 'home'" />

    <AppPageLayout v-else>
      <RouterView />
    </AppPageLayout>

    <AppNotifications />
  </div>
</template>

<script setup lang="ts">
import AppPageLayout from './components/AppPageLayout.vue';
import AppNotifications from './components/AppNotifications.vue';
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
  padding: size(2) size(4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
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
  text-decoration: none;
  border-bottom: 1px solid theme-color('primary');

  &:hover {
    color: theme-color('primary-hover');
  }
}

.h-sm {
  @include tpg-h4;
  color: theme-color('content-quaternary');
}

.cell {
  padding: 0 size(2);
}
</style>
