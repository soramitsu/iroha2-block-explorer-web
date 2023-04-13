<template>
  <div class="asset">
    <div class="asset__icon">
      <XOR v-if="nameLower=='xor'" />
      <VAL v-else-if="nameLower=='val'" />
      <ETH v-else-if="nameLower=='eth'" />
      <IrohaIcon v-else-if="nameLower=='iroha'" />
      <Soshiba v-else-if="nameLower=='soshiba'" />
      <Pswap v-else-if="nameLower=='pswap'" />
      <NaIcon v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

import XOR from '~icons/assets/XOR.svg';
import VAL from '~icons/assets/VAL.svg';
import ETH from '~icons/assets/ETH.svg';
import IrohaIcon from '~icons/assets/iroha_icon.svg';
import Soshiba from '~icons/assets/soshiba.svg';
import Pswap from '~icons/assets/pswap.svg';
import NaIcon from '~icons/assets/na.svg';

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
});

const { name } = toRefs(props);

let nameLower = '';

const init = async () => {
  nameLower = name.value.toLowerCase();
};

init();
</script>

<style lang="scss">
@import 'styles';

.asset {
  position: relative;
  display: grid;
  grid-gap: size(1);
  align-items: center;
  grid-auto-flow: column;
  grid-auto-columns: auto;

  &__icon {
    width: size(4);
    height: size(4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: size(4);
      height: size(4);
    }
  }
}
</style>
