import { expect, test } from 'vitest';
import { formatNumber, formatTimestamp } from './formatters';

test.each([
  [1234567.22312, '1,234,567.22312'],
  [1234123, '1,234,123'],
  [0.22312, '0.22312'],
  [100.1, '100.1'],
])('format %f as %s', (input, expected) => {
  expect(formatNumber(input)).toBe(expected);
});

test.each([
  [123, '123ms'],
  [1000 * 5, '5s'],
  [1000 * 59, '59s'],
  [1000 * 60, '1m'],
  [1000 * 60 * 59, '59m'],
  [1000 * 60 * 60, '1h'],
  [1000 * 60 * 60 * 23, '23h'],
  [1000 * 60 * 60 * 24, '1d'],
  [1000 * 60 * 60 * 24 * 3, '3d'],
])('format %f as %s', (input, expected) => {
  expect(formatTimestamp(input)).toBe(expected);
});
