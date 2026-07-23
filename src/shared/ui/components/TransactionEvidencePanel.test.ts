import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TransactionEvidencePanel from './TransactionEvidencePanel.vue';
import { NOT_FOUND, SUCCESSFUL_FETCHING, UNKNOWN_ERROR } from '@/shared/api/consts';

const api = vi.hoisted(() => ({
  fetchLedgerBlockProof: vi.fn(),
  fetchLedgerStateRoot: vi.fn(),
  fetchLedgerStateProof: vi.fn(),
}));

vi.mock('@/shared/api', () => api);

const proof = {
  proof: {
    block_height: '42',
    entry_hash: 'hash:entry',
    entry_root: 'hash:root',
    entry_proof: { leaf: 'hash:entry', proof: { leaf_index: 0, audit_path: [] } },
    result_root: null,
    result_proof: null,
    fastpq_transcripts: {},
  },
  verification: {
    valid: true,
    entry_hash_matches: true,
    entry_proof_valid: true,
    result_pair_consistent: true,
    result_proof_valid: null,
  },
};

const qc = {
  phase: 'Commit',
  subject_block_hash: 'hash:block',
  parent_state_root: 'hash:parent',
  post_state_root: 'hash:state',
  height: 42,
  view: 7,
  epoch: 3,
  mode_tag: 'sumeragi-v2',
  highest_qc: null,
  validator_set_hash: 'hash:validators',
  validator_set_hash_version: 1,
  validator_set: ['peer-a', 'peer-b'],
  aggregate: {
    signers_bitmap: '03',
    bls_aggregate_signature: 'cafe',
  },
};

function mountPanel() {
  return mount(TransactionEvidencePanel, {
    props: { blockHeight: 42, transactionHash: 'a'.repeat(64) },
    global: {
      stubs: {
        BaseContentBlock: {
          template: '<section><slot name="header-action"/><slot /></section>',
        },
        BaseResourceState: {
          props: ['snapshot'],
          emits: ['retry'],
          template: '<div><slot /></div>',
        },
        DataField: {
          props: ['title', 'value', 'hash'],
          template: '<div class="field">{{ title }}: {{ value ?? hash }}</div>',
        },
        BaseButton: {
          emits: ['click'],
          template: '<button @click="$emit(\'click\')"><slot /></button>',
        },
      },
    },
  });
}

describe('TransactionEvidencePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchLedgerBlockProof.mockResolvedValue({ status: SUCCESSFUL_FETCHING, data: proof });
    api.fetchLedgerStateRoot.mockResolvedValue({
      status: SUCCESSFUL_FETCHING,
      data: {
        height: 42,
        block_hash: 'hash:block',
        state_root: 'hash:state',
        source: 'commit_qc',
        commit_qc: qc,
      },
    });
    api.fetchLedgerStateProof.mockResolvedValue({
      status: SUCCESSFUL_FETCHING,
      data: { height: 42, block_hash: 'hash:block', state_root: 'hash:state', commit_qc: qc },
    });
  });

  it('distinguishes locally verified Merkle evidence from node-provided state and QC claims', async () => {
    const wrapper = mountPanel();
    await flushPromises();

    expect(wrapper.get('[data-test="block-proof-available"]').text()).toContain('Locally verified');
    expect(wrapper.text()).toContain('Node-provided · not cryptographically verified here');
    expect(wrapper.text()).toContain('Node-provided · BLS not verified here');
    expect(wrapper.text()).toContain('agree byte-for-byte');
    expect(wrapper.text()).toContain('Canonical decoded proof');
  });

  it('keeps unavailable and failed evidence explicit and retries only on user action', async () => {
    api.fetchLedgerBlockProof.mockResolvedValue({ status: NOT_FOUND });
    api.fetchLedgerStateRoot.mockResolvedValue({
      status: UNKNOWN_ERROR,
      error: new Error('state route failed'),
    });
    api.fetchLedgerStateProof.mockResolvedValue({ status: NOT_FOUND });

    const wrapper = mountPanel();
    await flushPromises();

    expect(wrapper.get('[data-test="block-proof-unavailable"]').text()).toContain('no block proof');
    expect(wrapper.get('[data-test="state-proof-unavailable"]').text()).toContain('No persisted');
    expect(wrapper.text()).toContain('state route failed');
    expect(api.fetchLedgerBlockProof).toHaveBeenCalledTimes(1);

    await wrapper.get('[data-test="evidence-retry"]').trigger('click');
    await flushPromises();
    expect(api.fetchLedgerBlockProof).toHaveBeenCalledTimes(2);
  });

  it('reloads evidence when the routed transaction identity changes', async () => {
    const wrapper = mountPanel();
    await flushPromises();
    await wrapper.setProps({ blockHeight: 43, transactionHash: 'b'.repeat(64) });
    await flushPromises();

    expect(api.fetchLedgerBlockProof).toHaveBeenLastCalledWith(43, 'b'.repeat(64));
    expect(api.fetchLedgerStateRoot).toHaveBeenLastCalledWith(43);
    expect(api.fetchLedgerStateProof).toHaveBeenLastCalledWith(43);
  });
});
