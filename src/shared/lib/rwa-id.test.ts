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

  it('normalizes UTS-46 domain labels while retaining fully qualified scope', () => {
    expect(normalizeDomainIdLiteral('BÜCHER.Main')).toBe('xn--bcher-kva.main');
    expect(normalizeDomainIdLiteral('BÜCHER.Example.Main')).toBe('xn--bcher-kva.example.main');
    expect(normalizeDomainIdLiteral('issuer_main.SORA')).toBe('issuer_main.sora');
    expect(normalizeDomainIdLiteral('ab--cd.main')).toBeNull();
  });

  it('matches the upstream domain profile rejection for Latin Extended Additional', () => {
    expect(normalizeDomainIdLiteral('\u1e00.Main')).toBeNull();
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
  ])('rejects invalid RWA id %s', (literal) => {
    expect(normalizeRwaIdLiteral(literal)).toBeNull();
  });

  it('keeps NFT literals distinguishable in search', () => {
    expect(normalizeRwaIdLiteral('cool-cat$gallery')).toBeNull();
  });
});
