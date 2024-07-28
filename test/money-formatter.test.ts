import { expect, test } from 'vitest';
import { numberFormatter } from '../src/shared/utils/money-formatters';

test('format number', () => {
  expect(numberFormatter(1234567.22312)).toBe('1,234,567.22312');
  expect(numberFormatter(1234123)).toBe('1,234,123');
  expect(numberFormatter(0.22312)).toBe('0.22312');
  expect(numberFormatter(100.1)).toBe('100.1');
});
