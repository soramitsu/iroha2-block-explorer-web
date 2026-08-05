import { canonicalizeDomainLabel } from '@iroha/iroha-js/browser';

export interface RwaIdDisplay {
  literal: string;
  hash: string;
  domain: string | null;
}

const RWA_HASH_PATTERN = /^[0-9a-fA-F]{64}$/;
function normalizeDomainComponent(value: string): string | null {
  try {
    return canonicalizeDomainLabel(value);
  } catch {
    return null;
  }
}

/** Canonical `DomainId::to_string()` wire form (`domain.dataspace`). */
export function normalizeDomainIdLiteral(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || !trimmed.includes('.')) return null;

  for (let index = trimmed.indexOf('.'); index >= 0; index = trimmed.indexOf('.', index + 1)) {
    const domain = normalizeDomainComponent(trimmed.slice(0, index));
    const dataspace = normalizeDomainComponent(trimmed.slice(index + 1));
    if (domain && dataspace) return `${domain}.${dataspace}`;
  }
  return null;
}

function coerceLiteral(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const toString = (value as { toString?: unknown }).toString;
  if (typeof toString !== 'function') return '';

  const literal = toString.call(value);
  return typeof literal === 'string' ? literal.trim() : '';
}

export function describeRwaId(value: unknown): RwaIdDisplay {
  const literal = coerceLiteral(value);
  if (!literal) return { literal: '', hash: '', domain: null };

  const separator = literal.indexOf('$');
  if (separator > 0 && separator < literal.length - 1) {
    return {
      literal,
      hash: literal.slice(0, separator),
      domain: literal.slice(separator + 1),
    };
  }

  return {
    literal,
    hash: literal,
    domain: null,
  };
}

export function normalizeRwaIdLiteral(value: string): string | null {
  const literal = value.trim();
  if (!literal || /\s/.test(literal)) return null;

  const { hash, domain } = describeRwaId(literal);
  if (!domain) return null;
  if (!RWA_HASH_PATTERN.test(hash)) return null;
  const canonicalDomain = normalizeDomainIdLiteral(domain);
  if (!canonicalDomain) return null;

  return `${hash.toLowerCase()}$${canonicalDomain}`;
}

export function getRwaDomain(value: unknown): string | null {
  return describeRwaId(value).domain;
}
