import { expect, test } from 'vitest';
import { getLocalTime, getUTCTime } from '@/shared/lib/time';
import { mount } from '@vue/test-utils';
import { i18n } from '@/shared/lib/localization';
import TimeStamp from '@/shared/ui/components/TimeStamp.vue';

// Those tests are written for GMT+3 timezone.
// In other timezones they won't pass
test.each([
  [new Date('2024-09-11T07:22:47.157Z'), '11.09.2024 10:22:47 AM GMT+3'],
  [new Date(1730233940352), '29.10.2024 11:32:20 PM GMT+3'],
])('format %s to local time %s', (input, expected) => {
  expect(getLocalTime(input)).toBe(expected);
});

test.each([
  [new Date('2024-09-11T07:22:47.157Z'), '11.09.2024 07:22:47 AM UTC'],
  [new Date(1730233940352), '29.10.2024 08:32:20 PM UTC'],
])('format %s to UTC time %s', (input, expected) => {
  expect(getUTCTime(input)).toBe(expected);
});

const NOW = Date.now();

test.each([
  [new Date(NOW - 1000), '1 sec ago'],
  [new Date(NOW - 10000), '10 secs ago'],
  [new Date(NOW - 60000), '1 min ago'],
  [new Date(NOW - 180000), '3 mins ago'],
  [new Date(NOW - 4000000), '1 hour ago'],
  [new Date(NOW - 18002000), '5 hours ago'],
  [new Date(NOW - 90000000), '1 day ago'],
  [new Date(NOW - 1800000000), '20 days ago'],
])('Correct time difference display', (date, expected) => {
  const wrapper = mount(TimeStamp, {
    props: {
      value: date,
    },
    global: {
      plugins: [i18n],
    },
  });

  expect(wrapper.find('.time-ago').text()).toBe(expected);
});
