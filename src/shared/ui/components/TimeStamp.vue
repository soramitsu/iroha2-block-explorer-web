<script setup lang="ts">
const props = defineProps<{
  i18nKey: string
  firstValue: number
  secondValue: number
}>();
</script>

<template>
  <span class="timestamp">{{ $t(props.i18nKey, [props.firstValue, props.secondValue]) }}</span>
</template>

<style scoped lang="scss"></style>
