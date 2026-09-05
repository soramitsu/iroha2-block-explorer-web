import { toASCII } from 'tr46';

export interface RwaIdDisplay {
  literal: string;
  hash: string;
  domain: string | null;
}

const RWA_HASH_PATTERN = /^[0-9a-fA-F]{64}$/;
function normalizeDomainComponent(value: string): string | null {
  // Native DomainId wire labels are ASCII UTS-46 output. Accept that form
  // without substituting browser Unicode tables for Iroha's pinned profile.
  if (!/^[a-zA-Z0-9_][a-zA-Z0-9_-]{0,62}$/.test(value) || value.endsWith('-')) return null;
  const label = value.toLowerCase();
  try {
    const checked = toASCII(label, {
      checkHyphens: true,
      checkBidi: true,
      checkJoiners: true,
      useSTD3ASCIIRules: false,
      verifyDNSLength: true,
      transitionalProcessing: false,
    });
    return checked === label ? label : null;
  } catch {
    return null;
  }
}

/** Canonical ASCII `DomainId::to_string()` wire form (`domain.dataspace`). */
export function normalizeDomainIdLiteral(value: string): string | null {
  const parts = value.split('.');
  if (parts.length !== 2) return null;
  const domain = normalizeDomainComponent(parts[0]);
  const dataspace = normalizeDomainComponent(parts[1]);
  return domain && dataspace ? `${domain}.${dataspace}` : null;
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
  const literal = value;
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
