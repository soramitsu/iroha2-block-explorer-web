import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildMultisigCustomDisplayPayload } from './multisig-custom';
import { buildDecodedInstructionPresentation, buildInstructionPresentation } from './instruction-presentation';

// This verifies argument propagation, not native Wasm decoding or address semantics.
const decode = vi.hoisted(() => vi.fn());
vi.mock('@iroha/iroha-js/browser', async importOriginal => ({
  ...await importOriginal<typeof import('@iroha/iroha-js/browser')>(),
  noritoDecodeInstruction: decode,
}));

const encoded = btoa('synthetic encoded instruction');
const proposal = {
  Propose: { account: 'multisig@fixture', instructions: [encoded], transaction_ttl_ms: null },
};
const explorerInstruction = {
  kind: 'Custom',
  box: {
    encoded: '0x01', framed_sha256: `0x${'00'.repeat(32)}`,
    json: { kind: 'Custom', payload: { variant: 'Custom', value: proposal } },
  },
};

beforeEach(() => decode.mockReset());

describe('explicit network prefix propagation', () => {
  it.each([0, 369, 65535])('passes %s unchanged into every nested decode and presentation', networkPrefix => {
    decode.mockReturnValueOnce({ Custom: { payload: proposal } })
      .mockReturnValueOnce({ Log: { level: 'INFO', msg: 'nested payload unchanged' } });
    const result = buildInstructionPresentation(explorerInstruction, networkPrefix);

    expect(decode).toHaveBeenCalledTimes(2);
    expect(decode.mock.calls.map(args => args[1])).toEqual([networkPrefix, networkPrefix]);
    for (const [bytes] of decode.mock.calls) {
      expect(Array.from(bytes as Uint8Array)).toEqual(Array.from(new TextEncoder().encode(atob(encoded))));
    }
    const nested = result?.nestedInstructions[0]?.presentation;
    expect(nested?.registryKey).toBe('Custom:Propose');
    expect(nested?.nestedInstructions[0]?.presentation?.fields.find(field => field.key === 'message')?.value)
      .toBe('nested payload unchanged');
    expect(proposal.Propose.instructions).toEqual([encoded]);
  });

  it.each([undefined, null, '369', -1, 65536, 1.5])('rejects %s before evaluating the decoder', value => {
    const prefix = value as unknown as number;
    expect(() => buildMultisigCustomDisplayPayload(proposal, prefix)).toThrow('network prefix');
    expect(() => buildInstructionPresentation(explorerInstruction, prefix)).toThrow('network prefix');
    expect(() => buildDecodedInstructionPresentation({ Custom: { payload: proposal } }, prefix)).toThrow('network prefix');
    expect(decode).not.toHaveBeenCalled();
  });

  it('bounds recursive nested Custom proposals', () => {
    decode.mockReturnValue({ Custom: { payload: proposal } });
    const result = buildDecodedInstructionPresentation({ Custom: { payload: proposal } }, 369);
    let depth = 0;
    let current = result;
    while (current) {
      depth++;
      current = current.nestedInstructions[0]?.presentation ?? null;
    }
    expect(depth).toBe(8);
    expect(decode).toHaveBeenCalledTimes(8);
    expect(decode.mock.calls.every(args => args[1] === 369)).toBe(true);
  });

  it.each([
    { Custom: proposal },
    { Custom: { payload: proposal, extra: true } },
    { Custom: { payload: { ...proposal, Cancel: {} } } },
  ])('rejects noncanonical decoded Custom envelope %j', decoded => {
    expect(buildDecodedInstructionPresentation(decoded, 369)).toBeNull();
    expect(decode).not.toHaveBeenCalled();
  });
});
