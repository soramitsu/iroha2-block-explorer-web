import { describe, expect, it } from 'vitest';
import {
  buildMultisigCustomDisplayPayload,
  readMultisigCustomEnvelope,
} from './multisig-custom';

const SAMPLE_I105 = 'sorauﾛ1NﾗhBUd2BﾂｦﾄiﾔﾆﾂﾇKSﾃaﾘﾒﾓQﾗrﾒoﾘﾅnｳﾘbQｳQJﾆLJ5HSE';
const SAMPLE_I105_ALT = 'sorauﾛ1PﾉｳﾇmEｴWｵebHﾑ6ﾔﾙｲヰiwuCWErJ7uｽoPGｱﾔnjﾑKﾋTCW2PV';
const LIVE_TRANSFER_SOURCE =
  '66owaQmAQMuHxPzxUN3bqZ6FJfDa#soraﾁｷVMXKﾏtKAoQﾅﾛ3qｾヱ8aﾄdNuｷﾀｱｽh9ｻtWﾐBﾒ9AﾏHｼQﾅvﾛﾌｹYﾑﾐﾛCﾎjtQQヰYCbﾎｵPfb6vXcﾖ1176ﾃﾈcﾐｲUEtﾎヱﾅｻﾀiuｦ2MPﾍﾏiﾌhﾓJｶｶgboCｻBpｷ35ｸ15ｼmGｲFK9NﾑoVﾜWvQMKﾃﾎB7ヰdM99EU4V';
const LIVE_TRANSFER_DESTINATION = 'sorauﾛ1QEﾄiBzndﾆDwﾉｴxSﾔﾋ6KXﾆ2xﾗﾆrﾐﾚﾄoNqｳZﾘqtHﾛDBCRJ5';
const LIVE_TRANSFER_INSTRUCTION_B64 =
  'TlJUMAAAhip9dwddTSP/bBJh2wJ4EQDSAQAAAAAAABQKMDTp3Yu+Ag8OaXJvaGEudHJhbnNmZXLAA7gBAAAAAAAATlJUMAAApBdMeNY0H4+Y/Cra6O1nuQCQAQAAAAAAAOy4mMbcuTFWAgIAAACKA6oCggIBAAAA/AEBAQICAPUBAwAAAAAAAABOSiEAAAAAAAAAAQABhAExAb0BZQH/ASQBcwHNAacBpwEHAcEBgAH3AcEB5AH2AcQBzAGVASABPQFuAXoBJwFLAYUBswHtAW8BbAE1AgEATkohAAAAAAAAAAEAAbQBJgHPAXIBUQE3Af8B5gEzAbkB7gFJAXQBIAGoAYIB2gGYAW0BNgGxAfMBgQGPASEBkQFsAdUBtQH9AUoB/QIBAE5KIQAAAAAAAAABAAHHAeIB8QH8AZMBSQHvAZ8BkgG6AYEBeAFSAa4BbQGBAV0B2wGyAWABgQHUAWsBrQHiATMBSwERATwBHwF/AWUCAQAgAW4BFQFrAVABEAHmAUUB+AGDAesBgwEZAUYBuAGNAbgEAAAAAA0HAwAAAKCGAQQAAAAATwAAAABKIQAAAAAAAAABAAH9AVUB7wEWAZIB1QGPAYcBkwEvAVkBgAEhAbEB1gEWATkBRwGAAQgBIwHlAb4BuQF0AcoBiAEEAZoByAGaAfc=';

describe('readMultisigCustomEnvelope', () => {
  it('reads direct multisig custom payload shape', () => {
    const payload = {
      Register: {
        account: SAMPLE_I105,
        instructions: ['aXJvaGEucmVnaXN0ZXI='],
        transaction_ttl_ms: 60_000,
      },
    };

    expect(readMultisigCustomEnvelope(payload)).toEqual({
      variant: 'Register',
      account: SAMPLE_I105,
      instructions: ['aXJvaGEucmVnaXN0ZXI='],
      transaction_ttl_ms: 60_000,
    });
  });

  it('reads nested production-style multisig payload shape', () => {
    const payload = {
      variant: 'Custom',
      value: {
        Propose: {
          account: SAMPLE_I105_ALT,
          instructions: ['aXJvaGEudHJhbnNmZXI='],
          transaction_ttl_ms: null,
        },
      },
    };

    expect(readMultisigCustomEnvelope(payload)).toEqual({
      variant: 'Propose',
      account: SAMPLE_I105_ALT,
      instructions: ['aXJvaGEudHJhbnNmZXI='],
      transaction_ttl_ms: null,
    });
  });

  it('returns null for non-multisig custom payload shape', () => {
    const payload = {
      extension: {
        account: SAMPLE_I105,
      },
    };

    expect(readMultisigCustomEnvelope(payload)).toBeNull();
  });

  it('reads the canonical Cancel variant', () => {
    expect(readMultisigCustomEnvelope({
      variant: 'Custom',
      value: {
        Cancel: {
          account: SAMPLE_I105,
          instructions_hash: '0x1234',
        },
      },
    })).toEqual({
      variant: 'Cancel',
      account: SAMPLE_I105,
      instructions: [],
      transaction_ttl_ms: null,
    });
  });
});

describe('buildMultisigCustomDisplayPayload', () => {
  it('builds readable summary including decoded nested instruction metadata', () => {
    const payload = {
      value: {
        Propose: {
          account: SAMPLE_I105,
          instructions: [LIVE_TRANSFER_INSTRUCTION_B64],
          transaction_ttl_ms: 120_000,
        },
      },
      variant: 'Custom',
    };

    const result = buildMultisigCustomDisplayPayload(payload);

    expect(result).not.toBeNull();
    expect(result?.multisig.variant).toBe('Propose');
    expect(result?.multisig.instructions_count).toBe(1);
    expect(result?.multisig.decoded_instructions[0]).toEqual({
      index: 0,
      kind: 'Transfer',
      instruction: {
        Transfer: {
          Asset: {
            source: LIVE_TRANSFER_SOURCE,
            object: '100000',
            destination: LIVE_TRANSFER_DESTINATION,
          },
        },
      },
    });
    expect(result?.raw_payload).toEqual(payload);
  });

  it('keeps decoded metadata null when nested payload bytes are not decodable', () => {
    const payload = {
      Approve: {
        account: SAMPLE_I105,
        instructions: ['%%%'],
      },
    };

    const result = buildMultisigCustomDisplayPayload(payload);

    expect(result?.multisig.decoded_instructions[0]).toEqual({
      index: 0,
      kind: null,
      instruction: null,
    });
  });

  it('keeps decoded metadata null when valid base64 is not a Norito instruction', () => {
    const payload = {
      Approve: {
        account: SAMPLE_I105,
        instructions: ['aXJvaGEudHJhbnNmZXI='],
      },
    };

    const result = buildMultisigCustomDisplayPayload(payload);

    expect(result?.multisig.decoded_instructions[0]).toEqual({
      index: 0,
      kind: null,
      instruction: null,
    });
  });

  it('decodes each nested instruction independently and preserves its index', () => {
    const payload = {
      Propose: {
        account: SAMPLE_I105,
        instructions: [LIVE_TRANSFER_INSTRUCTION_B64, '%%%', LIVE_TRANSFER_INSTRUCTION_B64],
      },
    };

    const result = buildMultisigCustomDisplayPayload(payload);

    expect(result?.multisig.decoded_instructions.map(({ index, kind, instruction }) => ({
      index,
      kind,
      decoded: instruction !== null,
    }))).toEqual([
      { index: 0, kind: 'Transfer', decoded: true },
      { index: 1, kind: null, decoded: false },
      { index: 2, kind: 'Transfer', decoded: true },
    ]);
  });
});
