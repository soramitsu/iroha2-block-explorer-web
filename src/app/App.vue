<template>
  <div class="app">
    <RouterView v-if="$route?.name === 'home'" />

    <template v-else>
      <TheHeader />

      <BasePageLayout>
        <RouterView />
      </BasePageLayout>
    </template>

    <NotificationsInstance />
  </div>
</template>

<script setup lang="ts">
import NotificationsInstance from '@/shared/ui/components/NotificationsInstance.vue';
import BasePageLayout from '@/shared/ui/components/BasePageLayout.vue';
import { TheHeader } from '@/widgets/header';
</script>

<style lang="scss">
@import '@/shared/ui/styles/main';

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
  overflow-x: hidden;
  z-index: 0;
  position: relative;
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

  &[data-vertical] {
    width: 1px;
    height: 100%;
  }
}

.content-row {
  padding: 0 size(2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  border-top: 1px solid theme-color('border-primary');

  @include sm {
    padding: 0 size(3);
  }

  @include md {
    padding: 0 size(2);
  }

  &_empty {
    justify-content: center;
  }
}

.content-row--with-hover:hover {
  box-shadow: theme-shadow('row');

  + hr {
    background: transparent;
    box-shadow: none;
  }
}

.h-sm {
  @include tpg-h4;
  color: theme-color('content-quaternary');
}

.cell {
  padding: 0 size(2);
}

.nowrap {
  white-space: nowrap;
}

.row-text {
  @include tpg-s3;
  color: theme-color('content-primary');
}
</style>
