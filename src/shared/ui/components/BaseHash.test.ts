import { expect, test } from 'vitest';
import { mount } from '@vue/test-utils';
import BaseHash from './BaseHash.vue';
import { i18n } from '@/shared/lib/localization';

test.each([
  [
    { hash: 'ed01204164BF554923ECE1FD412D241036D863A6AE430476C898248B8237D77534CFC4@genesis', type: 'full' as const },
    'ed01204164BF554923ECE1FD412D241036D863A6AE430476C898248B8237D77534CFC4@genesis',
  ],
  [
    { hash: 'ed01204164BF554923ECE1FD412D241036D863A6AE430476C898248B8237D77534CFC4@genesis', type: 'medium' as const },
    'ed01204164...D77534CFC4@genesis',
  ],
  [
    { hash: 'ed01204164BF554923ECE1FD412D241036D863A6AE430476C898248B8237D77534CFC4@genesis', type: 'short' as const },
    'ed01...CFC4@genesis',
  ],
  [
    {
      hash: 'ed01204164BF554923ECE1FD412D241036D863A6AE430476C898248B8237D77534CFC4@genesis',
      type: 'two-line' as const,
    },
    'ed01...CFC4<br>@genesis',
  ],
])('BaseHash content display correctness', async (props, expected) => {
  const wrapper = mount(BaseHash, {
    props: {
      hash: props.hash,
      type: props.type,
    },
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.find('.base-hash span').element.innerHTML).toBe(expected);
});
