import { expect, test } from 'vitest';
import { formatUTC, getTimeAgo } from '@/shared/lib/time';
import { mount } from '@vue/test-utils';
import { i18n } from '@/shared/lib/localization';

test.each([
  [new Date('2024-09-11T07:22:47.157Z'), 'Sep-11-2024 10:22:47 AM UTC'],
  [new Date(1726641137724), 'Sep-18-2024 09:32:17 AM UTC'],
])('format %f to %s', (input, expected) => {
  expect(formatUTC(input)).toBe(expected);
});

const NOW = Date.now()

test.each([
  [new Date(NOW - 11000), '0 min 11 sec ago'],
  [new Date(NOW - 3599000), '59 min 59 sec ago'],
  [new Date(NOW - 4000000), '1 hours 6 min ago'],
])('Correct time difference display', (date, expected) => {
  const Timestamp = {
    template: `
      <span class="timestamp">{{ getTimeAgo(now,date) }}</span>
  `,

    data() {
      return {
        now: Date.now(),
        date,
        getTimeAgo,
      };
    },
  };

  const wrapper = mount(Timestamp, {
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.find('.timestamp').text()).toBe(expected);
});
