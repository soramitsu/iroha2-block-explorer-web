<template>
  <div class="base-page-layout">
    <slot />
  </div>
</template>

<style lang="scss">
@import '@/shared/ui/styles/main';

.base-page-layout {
  padding: 0 size(1) size(3) size(1);
  min-height: calc(100vh - $header-height-mobile);
  display: grid;
  margin: 0 auto;
  max-width: 100%;

  @include xs {
    padding: 0 size(2) size(4) size(2);
    min-height: calc(100vh - $header-height-landscape-mobile);
  }

  @include md {
    padding: 0 size(3) size(5) size(3);
    min-height: calc(100vh - $header-height);
  }

  @include xl {
    width: $xl;
  }

  @include xxl {
    padding: 0 size(7) size(7) size(7);
    width: $xxl;
  }
}
</style>
