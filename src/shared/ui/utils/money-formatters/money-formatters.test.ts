import { expect, test } from 'vitest';
import { numberFormatter } from './money-formatters';

test.each([
  [1234567.22312, '1,234,567.22312'],
  [1234123, '1,234,123'],
  [0.22312, '0.22312'],
  [100.1, '100.1'],
])('format number', (input, expected) => {
  expect(numberFormatter(input)).toBe(expected);
});
