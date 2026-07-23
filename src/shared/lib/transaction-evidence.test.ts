import { describe, expect, it, vi } from 'vitest';
import { NOT_FOUND, SUCCESSFUL_FETCHING, UNKNOWN_ERROR } from '@/shared/api/consts';
import {
  evidencePartFromResult,
  evidencePartFromSettled,
  loadTransactionEvidence,
  stateEvidenceAgreement,
  type TransactionEvidenceBundle,
} from './transaction-evidence';

describe('transaction evidence orchestration', () => {
  it('maps successful, unavailable, and failed API results without disguising them', () => {
    expect(evidencePartFromResult({ status: SUCCESSFUL_FETCHING, data: 'proof' })).toEqual({
      status: 'available',
      data: 'proof',
    });
    expect(evidencePartFromResult<string>({ status: NOT_FOUND })).toEqual({ status: 'unavailable' });
    expect(
      evidencePartFromResult<string>({ status: UNKNOWN_ERROR, error: new Error('rejected') })
    ).toMatchObject({ status: 'error', problem: { kind: 'invalid-response', message: 'rejected' } });
  });

  it('maps rejected requests to an explicit problem', () => {
    expect(evidencePartFromSettled<string>({ status: 'rejected', reason: new TypeError('offline') }))
      .toEqual({ status: 'error', problem: { kind: 'network', message: 'offline' } });
  });

  it('starts all authoritative requests together and preserves partial availability', async () => {
    const calls: string[] = [];
    const fetchBlockProof = vi.fn(async () => {
      calls.push('block');
      return { status: SUCCESSFUL_FETCHING, data: { id: 'block-proof' } } as const;
    });
    const fetchStateRoot = vi.fn(async () => {
      calls.push('root');
      return { status: NOT_FOUND } as const;
    });
    const fetchStateProof = vi.fn(async () => {
      calls.push('qc');
      throw new TypeError('node unavailable');
    });

    const pending = loadTransactionEvidence({ fetchBlockProof, fetchStateRoot, fetchStateProof });
    expect(calls).toEqual(['block', 'root', 'qc']);
    await expect(pending).resolves.toEqual({
      blockProof: { status: 'available', data: { id: 'block-proof' } },
      stateRoot: { status: 'unavailable' },
      stateProof: { status: 'error', problem: { kind: 'network', message: 'node unavailable' } },
    });
  });

  it('reports state-root agreement only when both node responses are present', () => {
    const matching: TransactionEvidenceBundle<unknown, { state_root: string }, { state_root: string }> = {
      blockProof: { status: 'unavailable' },
      stateRoot: { status: 'available', data: { state_root: 'hash:a' } },
      stateProof: { status: 'available', data: { state_root: 'hash:a' } },
    };
    expect(stateEvidenceAgreement(matching)).toBe(true);
    expect(stateEvidenceAgreement({
      ...matching,
      stateProof: { status: 'available', data: { state_root: 'hash:b' } },
    })).toBe(false);
    expect(stateEvidenceAgreement({ ...matching, stateProof: { status: 'unavailable' } })).toBeNull();
  });
});
