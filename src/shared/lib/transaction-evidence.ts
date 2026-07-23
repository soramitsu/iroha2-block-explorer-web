import { NOT_FOUND, SUCCESSFUL_FETCHING, type UnknownError } from '@/shared/api/consts';
import type { ApiProblem } from '@/shared/utils/resource-state';
import { apiProblemFromError } from '@/shared/utils/resource-state';

export type EvidenceApiResult<T> =
  | { status: typeof SUCCESSFUL_FETCHING, data: T }
  | { status: typeof NOT_FOUND }
  | { status: UnknownError, error: Error };

export type EvidencePart<T> =
  | { status: 'available', data: T }
  | { status: 'unavailable' }
  | { status: 'error', problem: ApiProblem };

export interface TransactionEvidenceBundle<BlockProof, StateRoot, StateProof> {
  blockProof: EvidencePart<BlockProof>
  stateRoot: EvidencePart<StateRoot>
  stateProof: EvidencePart<StateProof>
}

export interface TransactionEvidenceRequests<BlockProof, StateRoot, StateProof> {
  fetchBlockProof: () => Promise<EvidenceApiResult<BlockProof>>
  fetchStateRoot: () => Promise<EvidenceApiResult<StateRoot>>
  fetchStateProof: () => Promise<EvidenceApiResult<StateProof>>
}

export function evidencePartFromResult<T>(result: EvidenceApiResult<T>): EvidencePart<T> {
  if (result.status === SUCCESSFUL_FETCHING) {
    return { status: 'available', data: result.data };
  }
  if (result.status === NOT_FOUND) return { status: 'unavailable' };
  return { status: 'error', problem: apiProblemFromError(result.error) };
}

export function evidencePartFromSettled<T>(
  result: PromiseSettledResult<EvidenceApiResult<T>>
): EvidencePart<T> {
  if (result.status === 'fulfilled') return evidencePartFromResult(result.value);
  return { status: 'error', problem: apiProblemFromError(result.reason) };
}

export async function loadTransactionEvidence<BlockProof, StateRoot, StateProof>(
  requests: TransactionEvidenceRequests<BlockProof, StateRoot, StateProof>
): Promise<TransactionEvidenceBundle<BlockProof, StateRoot, StateProof>> {
  const [blockProof, stateRoot, stateProof] = await Promise.allSettled([
    requests.fetchBlockProof(),
    requests.fetchStateRoot(),
    requests.fetchStateProof(),
  ]);

  return {
    blockProof: evidencePartFromSettled(blockProof),
    stateRoot: evidencePartFromSettled(stateRoot),
    stateProof: evidencePartFromSettled(stateProof),
  };
}

export function stateEvidenceAgreement(
  bundle: TransactionEvidenceBundle<unknown, { state_root: string }, { state_root: string }>
): boolean | null {
  if (bundle.stateRoot.status !== 'available' || bundle.stateProof.status !== 'available') return null;
  return bundle.stateRoot.data.state_root === bundle.stateProof.data.state_root;
}
