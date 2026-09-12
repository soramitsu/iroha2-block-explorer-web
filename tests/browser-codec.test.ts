import { describe, expect, it, vi } from 'vitest';
import { AccountAddress } from '@iroha/iroha-js/browser';
import { initializeTestBrowserCodec } from './helpers/initialize-browser-codec';

const qualifiedAccount = 'testuﾛ1NｵｦbﾐdjﾒeﾐｿkﾂoﾆZyﾅﾍｷ9ｱヱ3ｦFcﾚCｼqｦWﾗQP5ｷdGBW6CE';

describe('admitted package-owned browser codec in unit tests', () => {
  it('executes the actual SDK account owner after worker setup', () => {
    const { address, chainDiscriminant } = AccountAddress.parseEncoded(qualifiedAccount);
    expect(chainDiscriminant).toBe(369);
    expect(address.toI105(chainDiscriminant)).toBe(qualifiedAccount);
  });

  it('initializes the fresh real module after reset and restores test transport', async () => {
    vi.resetModules();
    const previousFetch = globalThis.fetch;
    await initializeTestBrowserCodec();
    expect(globalThis.fetch).toBe(previousFetch);
    const { AccountAddress: currentAccountAddress } = await import('@iroha/iroha-js/browser');
    const { address, chainDiscriminant } = currentAccountAddress.parseEncoded(qualifiedAccount);
    expect(address.toI105(chainDiscriminant)).toBe(qualifiedAccount);
  });
});
