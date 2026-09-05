import { describe, expect, it } from 'vitest';
import { describeRwaId, getRwaDomain, normalizeDomainIdLiteral, normalizeRwaIdLiteral } from './rwa-id';

const sampleHash = `${'00'.repeat(31)}01`;
const alternateHash = 'ff'.repeat(32);

describe('rwa id helpers', () => {
  it('splits hash$domain ids for display', () => {
    const literal = `${sampleHash}$commodities.main`;

    expect(describeRwaId(literal)).toEqual({
      literal,
      hash: sampleHash,
      domain: 'commodities.main',
    });
    expect(getRwaDomain(literal)).toBe('commodities.main');
  });

  it('normalizes uppercase hashes and domain labels to canonical wire form', () => {
    expect(normalizeRwaIdLiteral(`${alternateHash.toUpperCase()}$Commodities.Main`)).toBe(
      `${alternateHash}$commodities.main`
    );
  });

  it('accepts every canonical 64-hex hash shape without an invented marker bit', () => {
    expect(normalizeRwaIdLiteral(`${'00'.repeat(32)}$commodities.main`)).toBe(
      `${'00'.repeat(32)}$commodities.main`
    );
    expect(normalizeRwaIdLiteral(`${'fe'.repeat(32)}$commodities.main`)).toBe(
      `${'fe'.repeat(32)}$commodities.main`
    );
  });

  it('accepts canonical ASCII and punycode labels in exactly one fully qualified scope', () => {
    expect(normalizeDomainIdLiteral('XN--BCHER-KVA.Main')).toBe('xn--bcher-kva.main');
    expect(normalizeDomainIdLiteral('issuer_main.SORA')).toBe('issuer_main.sora');
    expect(normalizeDomainIdLiteral('123.456')).toBe('123.456');
    expect(normalizeDomainIdLiteral(`${'a'.repeat(63)}.main`)).toBe(`${'a'.repeat(63)}.main`);
  });

  it.each([
    'BÜCHER.Main',
    '\u1e00.Main',
    'commodities.example.main',
    'xn--bcher-kva.example.main',
    '.main',
    'commodities.',
    'commodities..main',
    ' commodities.main',
    'commodities.main\n',
    'commodities. main',
    '-commodities.main',
    'commodities-.main',
    'ab--cd.main',
    'xn--.main',
    'xn--a.main',
    `${'a'.repeat(64)}.main`,
  ])('rejects noncanonical or invalid domain wire literal %s', (literal) => {
    expect(normalizeDomainIdLiteral(literal)).toBeNull();
  });

  it.each([
    'cool-cat$gallery.main',
    'lot 001$commodities.main',
    `0123$commodities.main`,
    `${'0'.repeat(63)}$commodities.main`,
    `${'0'.repeat(65)}$commodities.main`,
    `${sampleHash}$commodities`,
    `${sampleHash}$-commodities.main`,
    `${sampleHash}$ab--cd.main`,
    `${sampleHash}$commodities.example.main`,
    ` ${sampleHash}$commodities.main`,
    `${sampleHash}$commodities.main\n`,
  ])('rejects invalid RWA id %s', (literal) => {
    expect(normalizeRwaIdLiteral(literal)).toBeNull();
  });

  it('keeps NFT literals distinguishable in search', () => {
    expect(normalizeRwaIdLiteral('cool-cat$gallery')).toBeNull();
  });
});
