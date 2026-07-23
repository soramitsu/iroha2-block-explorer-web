import type { LocationQuery, LocationQueryRaw } from 'vue-router';

export type RouteQueryPatchValue = string | number | boolean | string[] | null | undefined;

export function firstRouteQueryValue(value: unknown): string | null {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : null;
  return typeof value === 'string' ? value : null;
}

export function parseRoutePositiveInteger(
  value: unknown,
  fallback: number,
  allowed?: ReadonlySet<number>
): number {
  const raw = firstRouteQueryValue(value);
  if (!raw || !/^\d+$/u.test(raw)) return fallback;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
  if (allowed && !allowed.has(parsed)) return fallback;
  return parsed;
}

export function parseRouteEnum<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  fallback: T
): T {
  const raw = firstRouteQueryValue(value);
  return raw && allowed.has(raw as T) ? (raw as T) : fallback;
}

function serializePatchValue(value: RouteQueryPatchValue): LocationQueryRaw[string] {
  if (Array.isArray(value)) return [...value];
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  return value;
}

function comparableQueryValue(value: LocationQueryRaw[string]): string {
  return Array.isArray(value) ? value.join(',') : String(value ?? '');
}

export function mergeRouteQuery(
  current: LocationQuery | LocationQueryRaw,
  patch: Record<string, RouteQueryPatchValue>,
  defaults: Record<string, RouteQueryPatchValue> = {}
): LocationQueryRaw {
  const next: LocationQueryRaw = { ...current };

  for (const [key, rawValue] of Object.entries(patch)) {
    const value = serializePatchValue(rawValue);
    const defaultValue = serializePatchValue(defaults[key]);
    const isDefault = key in defaults && comparableQueryValue(value) === comparableQueryValue(defaultValue);

    if (value === null || value === undefined || value === '' || isDefault) delete next[key];
    else next[key] = value;
  }

  return next;
}

export function routeQueriesEqual(left: LocationQueryRaw, right: LocationQueryRaw): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every(
    (key, index) => key === rightKeys[index] && comparableQueryValue(left[key]) === comparableQueryValue(right[key])
  );
}
