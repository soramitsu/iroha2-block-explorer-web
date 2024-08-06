<template>
  <BaseTabs
    v-model="model"
    :items="tabs"
    :adaptive-options="props.adaptiveOptions"
  />
</template>

<script setup lang="ts">
import type * as ftm from './model';
import { useVModel } from '@vueuse/core';
import BaseTabs from '@/shared/ui/components/BaseTabs.vue';
import { computed } from 'vue';
import { blockOptions, defaultOptions } from './model';
import type { AdaptiveOptions } from '@/shared/ui/utils/adaptive-options';

interface Props {
  modelValue: ftm.DefaultTabs | ftm.BlockTabs
  defaultOptions?: boolean
  adaptiveOptions?: AdaptiveOptions
}

type Emits = (e: 'update:modelValue', value: ftm.DefaultTabs) => void;

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const tabs = computed(() => (props.defaultOptions ? defaultOptions : blockOptions));

const model = useVModel(props, 'modelValue', emit);
</script>
