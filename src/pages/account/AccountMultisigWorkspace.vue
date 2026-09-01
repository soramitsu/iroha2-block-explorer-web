<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { SUCCESSFUL_FETCHING } from '@/shared/api/consts';
import * as http from '@/shared/api';
import type {
  MultisigProposalStatus,
  MultisigProposalsQueryResponse,
  MultisigSpecResponse,
} from '@/shared/api/schemas';
import {
  ConnectApprovalRejectedError,
  ConnectSessionClosedError,
  ConnectSignRequestError,
  createConnectAppSession,
  createConnectCanonicalRequestAuth,
  createConnectSessionPreview,
  getConnectConfiguration,
  registerConnectSession,
  TORII_CANONICAL_REQUEST_DOMAIN_TAG,
  type ConnectAppSession,
  type ConnectCanonicalRequestAuth,
  type ConnectSessionResponse,
  type ConnectSessionPreview,
} from '@/shared/lib/connect';
import { buildDecodedInstructionPresentation } from '@/shared/lib/instruction-presentation';
import { firstRouteQueryValue, parseRouteEnum } from '@/shared/lib/route-query';
import BaseButton from '@/shared/ui/components/BaseButton.vue';
import BaseContentBlock from '@/shared/ui/components/BaseContentBlock.vue';
import BaseJson from '@/shared/ui/components/BaseJson.vue';
import BaseLink from '@/shared/ui/components/BaseLink.vue';
import BaseLoading from '@/shared/ui/components/BaseLoading.vue';
import InstructionSemanticCard from '@/shared/ui/components/InstructionSemanticCard.vue';
import { useRouteQueryState } from '@/shared/ui/composables/useRouteQueryState';

const props = defineProps<{
  accountId: string
}>();

type StatusFilter = 'ALL' | MultisigProposalStatus;
type WorkspaceState =
  | 'idle'
  | 'waiting-for-wallet'
  | 'loading'
  | 'ready'
  | 'not-found'
  | 'permission-denied'
  | 'wallet-rejected'
  | 'session-closed'
  | 'error';

const STATUS_FILTERS: StatusFilter[] = [
  'ALL',
  'COLLECTING_SIGNATURES',
  'FINALIZED',
  'CANCELED',
  'EXPIRED',
];
const STATUS_FILTER_VALUES = new Set<StatusFilter>(STATUS_FILTERS);
const PROPOSAL_LIMIT = 20;

const { route, updateRouteQuery } = useRouteQueryState();
const statusFilter = computed<StatusFilter>({
  get: () => parseRouteEnum(route.query.multisig_status, STATUS_FILTER_VALUES, 'ALL'),
  set: (value) => {
    updateRouteQuery(
      {
        multisig_status: value === 'ALL' ? null : value,
        multisig_cursor: null,
      },
      { history: 'replace' }
    ).catch(() => {});
  },
});
const cursor = computed(() => firstRouteQueryValue(route.query.multisig_cursor));
const connectConfiguration = getConnectConfiguration();

const preview = shallowRef<ConnectSessionPreview | null>(null);
const sessionResponse = shallowRef<ConnectSessionResponse | null>(null);
const canonicalAuth = shallowRef<ConnectCanonicalRequestAuth | null>(null);
const approvedAccountId = ref<string | null>(null);
const spec = shallowRef<MultisigSpecResponse | null>(null);
const proposalsResponse = shallowRef<MultisigProposalsQueryResponse | null>(null);
const workspaceState = ref<WorkspaceState>('idle');
const sessionError = ref<string | null>(null);
const workspaceError = ref<string | null>(null);
const isCreatingSession = ref(false);
let appSession: ConnectAppSession | null = null;
let workspaceGeneration = 0;
let proposalRequestGeneration = 0;

const canCreateSession = computed(() => connectConfiguration.available && !isCreatingSession.value);
const signatories = computed(() => Object.entries(spec.value?.spec.signatories ?? {}));

function closeAppSession(reason = 'multisig workspace closed') {
  workspaceGeneration += 1;
  proposalRequestGeneration += 1;
  appSession?.close(reason);
  appSession = null;
  canonicalAuth.value = null;
  approvedAccountId.value = null;
}

async function createWalletSession() {
  if (!connectConfiguration.available || isCreatingSession.value) return;

  closeAppSession('starting a new multisig read session');
  const generation = workspaceGeneration;
  preview.value = null;
  sessionResponse.value = null;
  spec.value = null;
  proposalsResponse.value = null;
  workspaceState.value = 'idle';
  sessionError.value = null;
  workspaceError.value = null;
  isCreatingSession.value = true;

  try {
    const toriiBaseUrl = http.getToriiBaseUrl();
    const createdPreview = createConnectSessionPreview({
      networkId: connectConfiguration.networkId,
      node: toriiBaseUrl,
    });
    const registeredSession = await registerConnectSession(toriiBaseUrl, createdPreview, {
      node: toriiBaseUrl,
    });
    if (generation !== workspaceGeneration) return;

    preview.value = createdPreview;
    sessionResponse.value = registeredSession;
  } catch (error) {
    if (generation !== workspaceGeneration) return;
    sessionError.value = error instanceof Error ? error.message : 'The Connect session could not be created.';
  } finally {
    if (generation === workspaceGeneration) isCreatingSession.value = false;
  }
}

async function loadProposals(generation = workspaceGeneration) {
  if (!canonicalAuth.value || !spec.value || generation !== workspaceGeneration) return;

  const requestGeneration = ++proposalRequestGeneration;
  workspaceState.value = 'loading';
  workspaceError.value = null;
  try {
    const result = await http.fetchMultisigProposals(
      props.accountId,
      {
        status: statusFilter.value === 'ALL' ? undefined : [statusFilter.value],
        cursor: cursor.value,
        limit: PROPOSAL_LIMIT,
      },
      canonicalAuth.value
    );
    if (generation !== workspaceGeneration || requestGeneration !== proposalRequestGeneration) return;

    if (result.status === 'permission-denied') {
      workspaceState.value = 'permission-denied';
      workspaceError.value = result.error.message;
      return;
    }
    if (result.status === 'not-found') {
      workspaceState.value = 'not-found';
      return;
    }
    if (result.status !== SUCCESSFUL_FETCHING) {
      workspaceState.value = 'error';
      workspaceError.value = result.error.message;
      return;
    }
    if (spec.value && result.data.resolved_multisig_account_id !== spec.value.resolved_multisig_account_id) {
      workspaceState.value = 'error';
      workspaceError.value = 'Torii returned different resolved account IDs for the multisig spec and proposals.';
      return;
    }

    proposalsResponse.value = result.data;
    workspaceState.value = 'ready';
  } catch (error) {
    if (generation !== workspaceGeneration || requestGeneration !== proposalRequestGeneration) return;
    workspaceState.value = 'error';
    workspaceError.value = error instanceof Error ? error.message : 'The proposal query failed.';
  }
}

async function authenticateAndLoad() {
  if (!preview.value || !sessionResponse.value) return;

  closeAppSession('re-authenticating multisig reads');
  const generation = workspaceGeneration;
  workspaceState.value = 'waiting-for-wallet';
  workspaceError.value = null;
  appSession = createConnectAppSession({
    baseUrl: http.getToriiBaseUrl(),
    preview: preview.value,
    session: sessionResponse.value,
    permissions: {
      methods: ['sign_raw'],
      resources: [TORII_CANONICAL_REQUEST_DOMAIN_TAG],
    },
    appMeta: {
      name: 'Iroha Explorer · read-only multisig',
      url: typeof window === 'undefined' ? null : window.location.origin,
    },
  });

  try {
    const auth = await createConnectCanonicalRequestAuth(appSession);
    if (generation !== workspaceGeneration) return;
    canonicalAuth.value = auth;
    approvedAccountId.value = auth.authAccountId;
    workspaceState.value = 'loading';

    const specResult = await http.fetchMultisigSpec(props.accountId, auth);
    if (generation !== workspaceGeneration) return;
    if (specResult.status === 'permission-denied') {
      workspaceState.value = 'permission-denied';
      workspaceError.value = specResult.error.message;
      return;
    }
    if (specResult.status === 'not-found') {
      workspaceState.value = 'not-found';
      return;
    }
    if (specResult.status !== SUCCESSFUL_FETCHING) {
      workspaceState.value = 'error';
      workspaceError.value = specResult.error.message;
      return;
    }

    spec.value = specResult.data;
    await loadProposals(generation);
  } catch (error) {
    if (generation !== workspaceGeneration) return;
    if (error instanceof ConnectApprovalRejectedError) {
      workspaceState.value = 'wallet-rejected';
      workspaceError.value = error.reason ?? error.message;
      return;
    }
    if (error instanceof ConnectSessionClosedError) {
      workspaceState.value = 'session-closed';
      workspaceError.value = error.reason ?? error.message;
      return;
    }
    if (error instanceof ConnectSignRequestError) {
      workspaceState.value = 'error';
      workspaceError.value = error.message;
      return;
    }

    workspaceState.value = 'error';
    workspaceError.value = error instanceof Error ? error.message : 'The multisig workspace could not be loaded.';
  }
}

watch(
  [statusFilter, cursor],
  () => {
    if (canonicalAuth.value) loadProposals();
  }
);

watch(
  () => props.accountId,
  () => {
    closeAppSession('multisig account changed');
    preview.value = null;
    sessionResponse.value = null;
    spec.value = null;
    proposalsResponse.value = null;
    workspaceState.value = 'idle';
    isCreatingSession.value = false;
  }
);

onBeforeUnmount(() => closeAppSession());
</script>

<template>
  <div class="account-multisig">
    <BaseContentBlock title="Iroha Connect · read-only access">
      <template #default>
        <div class="account-multisig__connect">
          <p class="row-text">
            Torii requires an account-signed canonical request for multisig reads. Explorer asks the wallet only
            for <code>sign_raw</code> under <code>{{ TORII_CANONICAL_REQUEST_DOMAIN_TAG }}</code>. This workspace
            has no proposal, approval, rejection, cancellation, fee, private-key, or submission controls.
          </p>

          <div
            v-if="!connectConfiguration.available"
            class="account-multisig__state row-text"
            role="status"
            data-test="multisig-connect-unavailable"
          >
            Iroha Connect is unavailable: {{ connectConfiguration.error.message }}
          </div>
          <template v-else>
            <div class="account-multisig__chain-field">
              <span>Exact network ID</span>
              <code data-test="multisig-network-id">{{ connectConfiguration.literal }}</code>
              <small>
                This genesis-derived identity comes from the deployment's signed runtime configuration; Explorer
                never infers it from a chain label or node URL.
              </small>
            </div>

            <div class="account-multisig__actions">
              <BaseButton
                bordered
                data-test="multisig-create-session"
                :disabled="!canCreateSession"
                @click="createWalletSession"
              >
                {{ isCreatingSession ? 'Creating session…' : 'Create Connect session' }}
              </BaseButton>
            </div>

            <p
              v-if="sessionError"
              class="account-multisig__error row-text"
              role="alert"
            >
              {{ sessionError }}
            </p>

            <div
              v-if="sessionResponse"
              class="account-multisig__session"
              data-test="multisig-session"
            >
              <div>
                <strong>Session ID</strong>
                <code>{{ sessionResponse.sid }}</code>
              </div>
              <div class="account-multisig__actions">
                <a
                  :href="sessionResponse.wallet_uri"
                  class="account-multisig__wallet-link"
                >
                  Open wallet
                </a>
                <BaseButton
                  bordered
                  data-test="multisig-authenticate"
                  :disabled="workspaceState === 'waiting-for-wallet' || workspaceState === 'loading'"
                  @click="authenticateAndLoad"
                >
                  Authenticate and load
                </BaseButton>
              </div>
            </div>
          </template>
        </div>
      </template>
    </BaseContentBlock>

    <BaseContentBlock title="Multisig specification and proposals">
      <template #default>
        <div
          v-if="workspaceState === 'idle'"
          class="account-multisig__state row-text"
          role="status"
        >
          Create a Connect session, open it in the wallet, then authenticate to read this workspace.
        </div>
        <div
          v-else-if="workspaceState === 'waiting-for-wallet'"
          class="account-multisig__state"
          role="status"
          data-test="multisig-waiting-wallet"
        >
          <BaseLoading />
          <span>Waiting for wallet approval…</span>
        </div>
        <div
          v-else-if="workspaceState === 'loading'"
          class="account-multisig__state"
          role="status"
        >
          <BaseLoading />
          <span>Requesting signed read-only data…</span>
        </div>
        <div
          v-else-if="workspaceState === 'permission-denied'"
          class="account-multisig__state"
          role="alert"
          data-test="multisig-permission-denied"
        >
          <span>Torii denied this authenticated multisig read. {{ workspaceError }}</span>
          <BaseButton
            bordered
            @click="authenticateAndLoad"
          >
            Retry authentication
          </BaseButton>
        </div>
        <div
          v-else-if="workspaceState === 'not-found'"
          class="account-multisig__state row-text"
          role="status"
          data-test="multisig-not-found"
        >
          This account has no readable active multisig specification.
        </div>
        <div
          v-else-if="workspaceState === 'wallet-rejected'"
          class="account-multisig__state row-text"
          role="alert"
          data-test="multisig-wallet-rejected"
        >
          The wallet declined this read-only session. {{ workspaceError }}
        </div>
        <div
          v-else-if="workspaceState === 'session-closed'"
          class="account-multisig__state row-text"
          role="alert"
          data-test="multisig-session-closed"
        >
          The Connect session closed before the read completed. {{ workspaceError }}
        </div>
        <div
          v-else-if="workspaceState === 'error'"
          class="account-multisig__state"
          role="alert"
          data-test="multisig-workspace-error"
        >
          <span>The multisig workspace could not be loaded. {{ workspaceError }}</span>
          <BaseButton
            bordered
            @click="authenticateAndLoad"
          >
            Retry authentication
          </BaseButton>
        </div>

        <template v-else-if="workspaceState === 'ready' && spec && proposalsResponse">
          <section
            class="account-multisig__spec"
            data-test="multisig-spec"
          >
            <div class="account-multisig__evidence">
              <span>Resolved multisig account</span>
              <BaseLink
                :to="`/accounts/${encodeURIComponent(spec.resolved_multisig_account_id)}`"
                monospace
              >
                {{ spec.resolved_multisig_account_id }}
              </BaseLink>
              <span>Authenticated reader</span>
              <BaseLink
                v-if="approvedAccountId"
                :to="`/accounts/${encodeURIComponent(approvedAccountId)}`"
                monospace
              >
                {{ approvedAccountId }}
              </BaseLink>
              <span v-else>Not provided</span>
              <span>Quorum weight</span>
              <code>{{ spec.spec.quorum }}</code>
              <span>Transaction TTL</span>
              <code>{{ spec.spec.transaction_ttl_ms }} ms</code>
            </div>

            <div class="account-multisig__signatories">
              <h4>Required signatories (server-provided, unverified)</h4>
              <p class="row-text">
                These account/weight entries are copied from Torii's active spec. Explorer does not independently
                verify the spec and does not infer which subset is required for any proposal.
              </p>
              <div
                v-for="([account, weight]) in signatories"
                :key="account"
                class="account-multisig__signatory"
              >
                <BaseLink
                  :to="`/accounts/${encodeURIComponent(account)}`"
                  monospace
                >
                  {{ account }}
                </BaseLink>
                <span>Role: Signatory</span>
                <span>Weight: {{ weight }}</span>
              </div>
            </div>
          </section>

          <section class="account-multisig__proposals">
            <div class="account-multisig__proposal-toolbar">
              <label>
                <span>Status</span>
                <select
                  v-model="statusFilter"
                  data-test="multisig-status-filter"
                >
                  <option
                    v-for="status in STATUS_FILTERS"
                    :key="status"
                    :value="status"
                  >
                    {{ status }}
                  </option>
                </select>
              </label>
              <div class="account-multisig__actions">
                <BaseButton
                  v-if="cursor"
                  bordered
                  data-test="multisig-first-page"
                  @click="updateRouteQuery({ multisig_cursor: null }, { history: 'push' })"
                >
                  First page
                </BaseButton>
                <BaseButton
                  v-if="proposalsResponse.next_cursor"
                  bordered
                  data-test="multisig-next-page"
                  @click="updateRouteQuery({ multisig_cursor: proposalsResponse.next_cursor }, { history: 'push' })"
                >
                  Next page
                </BaseButton>
              </div>
            </div>

            <p
              v-if="cursor"
              class="row-text"
            >
              Current opaque cursor: <code>{{ cursor }}</code>
            </p>

            <div
              v-if="proposalsResponse.proposals.length === 0"
              class="account-multisig__state row-text"
              role="status"
              data-test="multisig-empty"
            >
              No proposals match this authenticated query.
            </div>

            <article
              v-for="proposal in proposalsResponse.proposals"
              :key="proposal.proposal_id"
              class="account-multisig__proposal"
              data-test="multisig-proposal"
            >
              <header>
                <div>
                  <span class="account-multisig__eyebrow">{{ proposal.operation_type }}</span>
                  <h4>{{ proposal.status }}</h4>
                </div>
                <code>{{ proposal.proposal_id }}</code>
              </header>

              <dl class="account-multisig__proposal-meta">
                <div>
                  <dt>Instructions hash</dt>
                  <dd><code>{{ proposal.instructions_hash }}</code></dd>
                </div>
                <div>
                  <dt>Proposed at</dt>
                  <dd><code>{{ proposal.proposal.proposed_at_ms }} ms</code></dd>
                </div>
                <div>
                  <dt>Expires at</dt>
                  <dd><code>{{ proposal.proposal.expires_at_ms }} ms</code></dd>
                </div>
                <div>
                  <dt>Terminal at</dt>
                  <dd><code>{{ proposal.terminal_at_ms ?? 'not terminal' }}</code></dd>
                </div>
              </dl>

              <section class="account-multisig__approvals">
                <h5>Approvals</h5>
                <p
                  v-if="proposal.proposal.approvals.length === 0"
                  class="row-text"
                >
                  No approvals recorded.
                </p>
                <ul v-else>
                  <li
                    v-for="account in proposal.proposal.approvals"
                    :key="account"
                  >
                    <BaseLink
                      :to="`/accounts/${encodeURIComponent(account)}`"
                      monospace
                    >
                      {{ account }}
                    </BaseLink>
                  </li>
                </ul>
              </section>

              <section class="account-multisig__instructions">
                <h5>Decoded instructions</h5>
                <article
                  v-for="(instruction, index) in proposal.proposal.instructions"
                  :key="`${proposal.proposal_id}:${index}`"
                  class="account-multisig__instruction"
                >
                  <InstructionSemanticCard
                    v-if="buildDecodedInstructionPresentation(instruction)"
                    :presentation="buildDecodedInstructionPresentation(instruction)!"
                    compact
                  />
                  <div v-else>
                    <strong>Instruction #{{ index }}</strong>
                    <BaseJson
                      :value="instruction"
                      full
                    />
                  </div>
                </article>
              </section>

              <details class="account-multisig__raw">
                <summary>Canonical proposal JSON</summary>
                <BaseJson
                  :value="proposal"
                  full
                />
              </details>
            </article>
          </section>
        </template>
      </template>
    </BaseContentBlock>
  </div>
</template>

<style lang="scss">
@use '@/shared/ui/styles/main' as *;

.account-multisig {
  display: flex;
  flex-direction: column;
  gap: size(2);

  &__connect,
  &__spec,
  &__proposals {
    padding: size(2) size(4) size(4);
  }

  &__connect {
    > p:first-child {
      margin: 0 0 size(2);
      padding: size(2);
      border-inline-start: 3px solid theme-color('primary');
      background: theme-color('background-hover');
    }
  }

  &__state {
    min-height: size(12);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: size(2);
    padding: size(2) size(4);
    text-align: center;
  }

  &__chain-field {
    max-width: size(58);
    display: grid;
    gap: size(1);

    input,
    select {
      min-width: 0;
      padding: size(1.5) size(2);
      border: 1px solid theme-color('border-primary');
      border-radius: size(2);
      color: theme-color('content-primary');
      background: theme-color('background');
    }

    small {
      color: theme-color('content-tertiary');
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: size(1);
    margin-top: size(2);
  }

  &__error {
    color: theme-color('error');
  }

  &__session {
    margin-top: size(2);
    padding: size(2);
    border: 1px solid theme-color('border-primary');
    border-radius: size(2);
    display: grid;
    gap: size(1);

    > div:first-child {
      display: grid;
      gap: size(0.5);
      overflow-wrap: anywhere;
    }
  }

  &__wallet-link {
    display: inline-flex;
    padding: size(1.5) size(2);
    border-radius: size(3);
    color: theme-color('content-secondary-bright');
    text-decoration: none;
    background: theme-color('background');
    @include shadow-elevated;
  }

  &__evidence {
    display: grid;
    grid-template-columns: minmax(10rem, 0.35fr) minmax(14rem, 1fr);
    gap: size(1) size(2);
    align-items: baseline;
    overflow-wrap: anywhere;
  }

  &__signatories {
    margin-top: size(3);

    h4,
    p {
      margin: 0 0 size(1);
    }
  }

  &__signatory {
    display: grid;
    grid-template-columns: minmax(14rem, 1fr) auto auto;
    gap: size(2);
    padding: size(1.5) 0;
    border-top: 1px solid theme-color('border-primary');
    align-items: baseline;
  }

  &__proposal-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: size(2);
    margin-bottom: size(2);

    label {
      display: grid;
      gap: size(0.5);
    }

    select {
      padding: size(1) size(2);
      border: 1px solid theme-color('border-primary');
      border-radius: size(2);
      color: theme-color('content-primary');
      background: theme-color('background');
    }
  }

  &__proposal {
    padding: size(3);
    border: 1px solid theme-color('border-primary');
    border-radius: size(2);
    background: theme-color('background-hover');

    & + & {
      margin-top: size(2);
    }

    > header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: size(2);

      h4 {
        margin: size(0.5) 0 0;
      }

      > code {
        max-width: 100%;
        overflow-wrap: anywhere;
      }
    }
  }

  &__eyebrow {
    color: theme-color('content-tertiary');
    @include tpg-s3;
  }

  &__proposal-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: size(2);
    margin: size(2) 0 0;

    dt {
      color: theme-color('content-tertiary');
    }

    dd {
      margin: size(0.5) 0 0;
      overflow-wrap: anywhere;
    }
  }

  &__approvals,
  &__instructions,
  &__raw {
    margin-top: size(2.5);

    h5 {
      margin: 0 0 size(1);
    }
  }

  &__approvals ul {
    margin: 0;
    padding-inline-start: size(3);
  }

  &__instruction + &__instruction {
    margin-top: size(1.5);
  }

  &__raw summary {
    cursor: pointer;
  }

  @include xxs {
    &__evidence,
    &__signatory {
      grid-template-columns: 1fr;
    }
  }
}
</style>
