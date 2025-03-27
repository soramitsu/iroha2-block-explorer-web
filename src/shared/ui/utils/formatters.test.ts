import { expect, test } from 'vitest';
import { formatNumber } from './formatters';

test.each([
  [1234567.22312, '1,234,567.22312'],
  [1234123, '1,234,123'],
  [0.22312, '0.22312'],
  [100.1, '100.1'],
])('format %f as %s', (input, expected) => {
  expect(formatNumber(input)).toBe(expected);
});
