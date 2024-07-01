<template>
  <svg
    class="base-loading"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 40"
  >
    <path
      d="M19.99 2a17.98 17.98 0 0 1 17.64 21.51 18 18 0 0 1-32.6 6.5A18 18 0 0 1 2 20"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
    />
  </svg>
</template>

<style lang="scss">
@import '@/styles/main';

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.base-loading {
  width: size(5);
  height: size(5);
  margin: 0 auto;
  animation: spin 2s linear 0s infinite;
  color: theme-color('content-quaternary');
}
</style>
