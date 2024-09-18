import { expect, test } from 'vitest';
import { formatUTC } from '@/shared/lib/time';

test.each([
  [new Date('2024-09-11T07:22:47.157Z'), 'Sep-11-2024 10:22:47 AM UTC'],
  [new Date(1726641137724), 'Sep-18-2024 09:32:17 AM UTC'],
])('format %f to %s', (input, expected) => {
  expect(formatUTC(input)).toBe(expected);
});
