import { expect, test } from 'vitest';
import type { HashType } from '@/shared/ui/composables/useAdaptiveHash';
import { useAdaptiveHash } from '@/shared/ui/composables/useAdaptiveHash';

const BREAKPOINTS_SIZES: Record<string, HashType> = {
  xxl: 'full',
  xl: 'medium',
  lg: 'short',
  sm: 'two-line',
} as const;

const MEDIUM_HASH_TYPE = 'medium';

test.each([
  [1750, 'full'],
  [1450, 'medium'],
  [1210, 'short'],
  [1000, 'short'],
  [850, 'two-line'],
  [490, 'short'],
  [450, 'short'],
])('Correct adaptive hash computation', (windowWidth, expected) => {
  window.innerWidth = windowWidth;
  const hashType = useAdaptiveHash(BREAKPOINTS_SIZES);
  expect(hashType.value).toBe(expected);
});

test.each([
  [1750, 'full'],
  [1450, 'medium'],
  [1210, 'short'],
  [1000, 'medium'],
  [850, 'two-line'],
  [490, 'medium'],
  [450, 'medium'],
])('Correct adaptive hash computation with defined default size', (windowWidth, expected) => {
  window.innerWidth = windowWidth;
  const hashType = useAdaptiveHash(BREAKPOINTS_SIZES, MEDIUM_HASH_TYPE);
  expect(hashType.value).toBe(expected);
});

test.each([
  [1750, 'short'],
  [1450, 'short'],
  [1210, 'short'],
  [1000, 'short'],
  [850, 'short'],
  [490, 'short'],
  [450, 'short'],
])('Correct adaptive hash computation with empty sizes', (windowWidth, expected) => {
  window.innerWidth = windowWidth;
  const hashType = useAdaptiveHash({});
  expect(hashType.value).toBe(expected);
});

test.each([
  [1750, 'medium'],
  [1450, 'medium'],
  [1210, 'medium'],
  [1000, 'medium'],
  [850, 'medium'],
  [490, 'medium'],
  [450, 'medium'],
])('Correct adaptive hash computation with empty sizes and defined default size', (windowWidth, expected) => {
  window.innerWidth = windowWidth;
  const hashType = useAdaptiveHash({}, MEDIUM_HASH_TYPE);
  expect(hashType.value).toBe(expected);
});
