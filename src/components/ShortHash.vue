<template>
  <span>{{ hash }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Props = {
  hash: string;
}

const props = defineProps<Props>();
const hash = computed(() => props.hash.slice(0, 4) + '...' + props.hash.slice(-4));
</script>
