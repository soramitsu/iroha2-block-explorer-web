import { describe, expect, it } from 'vitest';
import {
  ContractActivity,
  ContractActivityResponse,
  ContractEvent,
  ContractEventResponse,
} from './schemas';

const activity = {
  entrypoint_hash: 'tx-hash',
  result_ok: true,
  contract_address: 'tairac1router',
  contract_payload: { nested: { amount: 10 }, flags: [true, false] },
};

const event = {
  event_id: 'tx-hash:0',
  schema_version: 1,
  provenance: 'emitted',
  tx_hash_hex: 'tx-hash',
  block_height: 4,
  block_hash_hex: 'block-hash',
  result_ok: true,
  contract_address: 'tairac1router',
  module: 'router',
  event_kind: 'swap',
  payload: { amount: 10 },
};

describe('contract activity schemas', () => {
  it('preserves decoded JSON payloads from the authoritative projection', () => {
    expect(ContractActivity.parse(activity).contract_payload).toEqual(activity.contract_payload);
  });

  it('accepts only exact counted-list envelopes with a total', () => {
    expect(ContractActivityResponse.parse({
      items: [activity],
      total: 1,
      has_more: false,
      count_mode: 'exact',
    }).total).toBe(1);
    expect(() => ContractActivityResponse.parse({
      items: [],
      has_more: false,
      count_mode: 'bounded',
    })).toThrow();
  });

  it('rejects camelCase aliases instead of decoding a second shape', () => {
    expect(() => ContractActivity.parse({ ...activity, contractPayload: {} })).toThrow();
  });
});

describe('contract event schemas', () => {
  it('decodes provenance and payload without losing structured data', () => {
    const parsed = ContractEvent.parse(event);
    expect(parsed.provenance).toBe('emitted');
    expect(parsed.payload).toEqual({ amount: 10 });
  });

  it.each([
    [{ ...event, provenance: 'synthetic' }],
    [{ ...event, block_height: -1 }],
    [{ ...event, schema_version: 1.5 }],
  ])('rejects malformed event projections %#', (payload) => {
    expect(() => ContractEvent.parse(payload)).toThrow();
  });

  it('requires exact event history totals', () => {
    expect(ContractEventResponse.parse({
      items: [event],
      total: 1,
      has_more: false,
      count_mode: 'exact',
    }).items).toHaveLength(1);
    expect(() => ContractEventResponse.parse({
      items: [],
      has_more: false,
      count_mode: 'exact',
    })).toThrow();
  });
});
