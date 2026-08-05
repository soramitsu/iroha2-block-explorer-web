import { describe, expect, it } from 'vitest';
import { getAccountRoutePath, getDisplayedAccountId, getPreferredAccountId, normalizeAccountRoutePath } from './account-id';

describe('account id display helpers', () => {
  const testnetBaseUrl = 'https://taira.sora.org';
  const modernCanonicalId = 'sorauﾛ1NﾗhBUd2BﾂｦﾄiﾔﾆﾂﾇKSﾃaﾘﾒﾓQﾗrﾒoﾘﾅnｳﾘbQｳQJﾆLJ5HSE';
  const modernTestnetId = 'testuﾛ1NﾗhBUd2BﾂｦﾄiﾔﾆﾂﾇKSﾃaﾘﾒﾓQﾗrﾒoﾘﾅnｳﾘbQｳQJﾆLJ5HSE';

  it('prefers the explicit i105 account id when present', () => {
    expect(
      getPreferredAccountId({
        id: 'legacy-account-id',
        i105_address: '  sorauﾛ1PﾉｳﾇmEｴWｵebHﾑ6ﾔﾙｲヰiwuCWErJ7uｽoPGｱﾔnjﾑKﾋTCW2PV  ',
      })
    ).toBe('sorauﾛ1PﾉｳﾇmEｴWｵebHﾑ6ﾔﾙｲヰiwuCWErJ7uｽoPGｱﾔnjﾑKﾋTCW2PV');
  });

  it('falls back to the generic id when the i105 field is absent', () => {
    expect(
      getPreferredAccountId({
        id: {
          toString: () => 'fallback-account-id',
        },
        i105_address: '   ',
      })
    ).toBe('fallback-account-id');
  });

  it('preserves account ids exactly as provided for display', () => {
    expect(getDisplayedAccountId(modernCanonicalId, testnetBaseUrl)).toBe(modernCanonicalId);
    expect(getDisplayedAccountId(modernTestnetId, 'https://nexus.mof3.sora.org:18080')).toBe(modernTestnetId);
    expect(getPreferredAccountId({ id: modernCanonicalId }, testnetBaseUrl)).toBe(modernCanonicalId);
  });

  it('preserves account detail routes without rewriting their network literal', () => {
    expect(getAccountRoutePath(modernCanonicalId, testnetBaseUrl)).toBe(`/accounts/${encodeURIComponent(modernCanonicalId)}`);
    expect(normalizeAccountRoutePath(`/accounts/${encodeURIComponent(modernCanonicalId)}?foo=bar`, testnetBaseUrl)).toBe(
      `/accounts/${encodeURIComponent(modernCanonicalId)}?foo=bar`
    );
    expect(
      normalizeAccountRoutePath(`/accounts/${encodeURIComponent(modernTestnetId)}?foo=bar`, 'https://nexus.mof3.sora.org:18080')
    ).toBe(
      `/accounts/${encodeURIComponent(modernTestnetId)}?foo=bar`
    );
  });
});
