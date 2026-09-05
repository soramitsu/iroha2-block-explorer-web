import { describe, expect, it } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  concentrationTopN,
  computeSetChurn,
  decodeCommittedAssetActivity,
  giniCoefficient,
  herfindahlIndex,
  lorenzCurvePoints,
  median,
  nakamotoCoefficient,
  nearestRankQuantile,
  quantile,
  shannonEntropy,
  theilIndexT,
  normalizedEntropy,
  effectiveNumberFromEntropy,
} from './econometrics';

const SAMPLE_I105 =
  'sorauﾛ1NﾗhBUd2BﾂｦﾄiﾔﾆﾂﾇKSﾃaﾘﾒﾓQﾗrﾒoﾘﾅnｳﾘbQｳQJﾆLJ5HSE';
const SAMPLE_ASSET_DEFINITION_ID = '66owaQmAQMuHxPzxUN3bqZ6FJfDa';
const SAMPLE_ASSET_ID = `${SAMPLE_ASSET_DEFINITION_ID}#${SAMPLE_I105}`;

describe('econometrics', () => {
  it('computes gini coefficient', () => {
    expect(giniCoefficient([new BigNumber(1), new BigNumber(1), new BigNumber(1)])).toBe(0);
    expect(giniCoefficient([new BigNumber(0), new BigNumber(0), new BigNumber(0), new BigNumber(10)])).toBeCloseTo(
      0.75,
      8
    );
    expect(giniCoefficient([new BigNumber(1), new BigNumber(2), new BigNumber(3)])).toBeCloseTo(0.2222222, 6);
  });

  it('computes HHI and concentration ratios', () => {
    expect(herfindahlIndex([new BigNumber(1), new BigNumber(1), new BigNumber(1), new BigNumber(1)])).toBeCloseTo(
      0.25,
      8
    );
    expect(herfindahlIndex([new BigNumber(0), new BigNumber(0), new BigNumber(0), new BigNumber(10)])).toBeCloseTo(
      1,
      8
    );

    expect(concentrationTopN([new BigNumber(1), new BigNumber(1), new BigNumber(1), new BigNumber(1)], 1)).toBeCloseTo(
      0.25,
      8
    );
    expect(concentrationTopN([new BigNumber(0), new BigNumber(0), new BigNumber(0), new BigNumber(10)], 1)).toBeCloseTo(
      1,
      8
    );
  });

  it('computes median and quantiles', () => {
    expect(median([new BigNumber(1), new BigNumber(3), new BigNumber(2)])?.toNumber()).toBe(2);
    expect(median([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)])?.toNumber()).toBe(2.5);

    expect(quantile([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)], 0)?.toNumber()).toBe(1);
    expect(quantile([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)], 1)?.toNumber()).toBe(4);
    expect(quantile([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)], 0.5)?.toNumber()).toBe(
      2.5
    );

    expect(nearestRankQuantile([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)], 0)?.toNumber()).toBe(
      1
    );
    expect(nearestRankQuantile([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)], 1)?.toNumber()).toBe(
      4
    );
    expect(
      nearestRankQuantile([new BigNumber(1), new BigNumber(2), new BigNumber(3), new BigNumber(4)], 0.5)?.toNumber()
    ).toBe(2);
    expect(nearestRankQuantile([new BigNumber(1), new BigNumber(100)], 0.9)?.toNumber()).toBe(100);
    expect(nearestRankQuantile([new BigNumber(1), new BigNumber(100)], 0.99)?.toNumber()).toBe(100);
  });

  it('computes entropy/theil metrics', () => {
    const equal = [new BigNumber(1), new BigNumber(1), new BigNumber(1), new BigNumber(1)];
    expect(theilIndexT(equal)).toBeCloseTo(0, 12);
    expect(shannonEntropy(equal)).toBeCloseTo(Math.log(4), 12);
    expect(normalizedEntropy(equal)).toBeCloseTo(1, 12);
    expect(effectiveNumberFromEntropy(shannonEntropy(equal))).toBeCloseTo(4, 10);

    const concentrated = [new BigNumber(0), new BigNumber(0), new BigNumber(0), new BigNumber(10)];
    expect(shannonEntropy(concentrated)).toBeCloseTo(0, 12);
    expect(normalizedEntropy(concentrated)).toBeCloseTo(0, 12);
    expect(theilIndexT(concentrated)).toBeCloseTo(Math.log(4), 8);
  });

  it('computes Nakamoto coefficient for common thresholds', () => {
    const equal = [new BigNumber(100), new BigNumber(100)];
    expect(nakamotoCoefficient(equal, 0.33)).toBe(1);
    expect(nakamotoCoefficient(equal, 0.51)).toBe(2);
    expect(nakamotoCoefficient(equal, 0.67)).toBe(2);

    const concentrated = [new BigNumber(1), new BigNumber(100)];
    expect(nakamotoCoefficient(concentrated, 0.33)).toBe(1);
    expect(nakamotoCoefficient(concentrated, 0.51)).toBe(1);
    expect(nakamotoCoefficient(concentrated, 0.67)).toBe(1);
  });

  it('computes Lorenz curve points', () => {
    const values = [new BigNumber(1), new BigNumber(1), new BigNumber(1), new BigNumber(1)];
    const points = lorenzCurvePoints(values, 4);
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ population: 0, share: 0 });
    expect(points[4]).toEqual({ population: 1, share: 1 });
    expect(points[1]!.share).toBeCloseTo(0.25, 10);
    expect(points[2]!.share).toBeCloseTo(0.5, 10);
    expect(points[3]!.share).toBeCloseTo(0.75, 10);

    const concentrated = lorenzCurvePoints([new BigNumber(0), new BigNumber(0), new BigNumber(0), new BigNumber(10)], 4);
    expect(concentrated[3]!.share).toBeCloseTo(0, 10);
    expect(concentrated[4]!.share).toBeCloseTo(1, 10);
  });

  it('computes set churn', () => {
    const churn = computeSetChurn(['a', 'b', 'c'], ['b', 'c', 'd', 'd']);
    expect(churn.previous).toBe(3);
    expect(churn.current).toBe(3);
    expect(churn.retained).toBe(2);
    expect(churn.entered).toBe(1);
    expect(churn.exited).toBe(1);
    expect(churn.retentionPrev).toBeCloseTo(2 / 3, 10);
    expect(churn.retentionCurrent).toBeCloseTo(2 / 3, 10);
  });

  it('decodes the exact native committed Transfer Asset shape', () => {
    const activity = decodeCommittedAssetActivity('Transfer', {
      variant: 'Asset', value: { source: SAMPLE_ASSET_ID, object: '12.5', destination: SAMPLE_I105 },
    }, 'Committed');
    expect(activity?.definitionId).toBe(SAMPLE_ASSET_DEFINITION_ID);
    expect(activity?.amount.toString()).toBe('12.5');
    expect(activity?.source).toBe(SAMPLE_I105);
    expect(activity?.destination).toBe(SAMPLE_I105);
  });

  it.each(['Mint', 'Burn'] as const)('decodes the exact native %s Asset destination and quantity', (kind) => {
    const activity = decodeCommittedAssetActivity(kind, {
      variant: 'Asset', value: { object: '0.25', destination: SAMPLE_ASSET_ID },
    }, 'Committed');
    expect(activity?.definitionId).toBe(SAMPLE_ASSET_DEFINITION_ID);
    expect(activity?.amount.toString()).toBe('0.25');
    expect(activity?.source).toBeNull();
  });

  it('excludes rejected transactions and unrelated valid instruction variants', () => {
    expect(decodeCommittedAssetActivity('Transfer', {
      variant: 'Asset', value: { source: SAMPLE_ASSET_ID, object: '10', destination: SAMPLE_I105 },
    }, 'Rejected')).toBeNull();
    expect(decodeCommittedAssetActivity('Transfer', { variant: 'Domain', value: {} }, 'Committed')).toBeNull();
    expect(decodeCommittedAssetActivity('Mint', { variant: 'TriggerRepetitions', value: {} }, 'Committed')).toBeNull();
  });

  it.each([
    { object: SAMPLE_ASSET_ID, value: '10' },
    { variant: 'Asset', value: { object: SAMPLE_ASSET_ID, source: SAMPLE_I105, destination: SAMPLE_I105 } },
    { variant: 'Asset', value: { source: SAMPLE_ASSET_ID, amount: '10', destination: SAMPLE_I105 } },
    { variant: 'Asset', value: { source: SAMPLE_ASSET_ID, object: 10, destination: SAMPLE_I105 } },
    { variant: 'Asset', value: { source: SAMPLE_ASSET_ID, object: '1.00', destination: SAMPLE_I105 } },
    { variant: 'Asset', value: { source: SAMPLE_ASSET_ID, object: '-1', destination: SAMPLE_I105 } },
    { variant: 'Asset', value: { source: 'usd#issuer.main', object: '1', destination: SAMPLE_I105 } },
    { variant: 'Asset', value: { source: SAMPLE_ASSET_ID, object: '1', destination: 'treasury@banking.main' } },
  ])('rejects obsolete or noncanonical asset activity %#', (payload) => {
    expect(() => decodeCommittedAssetActivity('Transfer', payload, 'Committed')).toThrow();
  });

  it.each(['Atomic', 'Independent'])('does not infer settled %s batch amounts from transaction commitment', (mode) => {
    expect(() => decodeCommittedAssetActivity('Transfer', {
      variant: 'AssetBatch', value: { mode, entries: [{
        leg_id: 'leg-1', from: SAMPLE_I105, to: SAMPLE_I105,
        asset_definition: SAMPLE_ASSET_DEFINITION_ID, amount: '100',
      }] },
    }, 'Committed')).toThrow('individual settlement results are missing');
  });
});
