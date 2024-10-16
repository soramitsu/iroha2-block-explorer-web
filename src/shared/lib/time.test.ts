import { expect, test } from 'vitest';
import { formatUTC } from '@/shared/lib/time';
import { mount } from '@vue/test-utils';
import { i18n } from '@/shared/lib/localization';
import TimeAgo from '@/shared/ui/components/TimeAgo.vue';

test.each([
  [new Date('2024-09-11T07:22:47.157Z'), 'Sep-11-2024 10:22:47 AM UTC'],
  [new Date(1726641137724), 'Sep-18-2024 09:32:17 AM UTC'],
])('format %f to %s', (input, expected) => {
  expect(formatUTC(input)).toBe(expected);
});

const NOW = Date.now();

test.each([
  [new Date(NOW - 1000), '1 sec ago'],
  [new Date(NOW - 10000), '10 secs ago'],
  [new Date(NOW - 60000), '1 min ago'],
  [new Date(NOW - 180000), '3 mins ago'],
])('Correct time difference display', (date, expected) => {
  const wrapper = mount(TimeAgo, {
    props: {
      value: date,
    },
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.find('.time-ago').text()).toBe(expected);
});
