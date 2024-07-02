import type { AccountDto } from '@/api/accounts';
import type { AssetDto } from '@/api/assets';
import type { BlockShallow } from '@/api/blocks';
import type { DomainDto } from '@/api/domains';
import type { TransactionDto } from '@/api/transactions';
import { useAccountsStore } from '@/stores/accounts';
import { useAssetsStore } from '@/stores/assets';
import { useBlocksStore } from '@/stores/blocks';
import { useDomainsStore } from '@/stores/domains';
import { useTransactionsStore } from '@/stores/transactions';

export function setupFakeData() {
  useAccountsStore().accounts = fakeAccounts;
  useAssetsStore().assets = fakeAssets;
  useBlocksStore().blocks = fakeBlocks;
  useDomainsStore().domains = fakeDomains;
  useTransactionsStore().transactions = fakeTransactions;
}

const fakeAccounts: AccountDto[] = [
  {
    id: 'genesis@genesis',
    assets: [],
    metadata: {},
    roles: [],
  },
  {
    id: 'alice@wonderland',
    assets: [
      {
        account_id: 'alice@wonderland',
        definition_id: 'cabbage#garden_of_live_flowers',
        value: {
          t: 'Quantity',
          c: '44',
        },
      },
      {
        account_id: 'alice@wonderland',
        definition_id: 'rose#wonderland',
        value: {
          t: 'Quantity',
          c: '13',
        },
      },
    ],
    metadata: {
      key: {
        String: 'value',
      },
    },
    roles: [],
  },
  {
    id: 'bob@wonderland',
    assets: [],
    metadata: {
      key: {
        String: 'value',
      },
    },
    roles: [],
  },
  {
    id: 'carpenter@garden_of_live_flowers',
    assets: [],
    metadata: {},
    roles: [],
  },
];

const fakeAssets: AssetDto[] = [
  {
    account_id: 'alice@wonderland',
    definition_id: 'cabbage#garden_of_live_flowers',
    value: {
      t: 'Quantity',
      c: '44',
    },
  },
  {
    account_id: 'alice@wonderland',
    definition_id: 'rose#wonderland',
    value: {
      t: 'Quantity',
      c: '13',
    },
  },
];

const fakeBlocks: BlockShallow[] = [
  {
    height: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    block_hash: '5752a85e966936e65d0cb31f2b0e8d8705f81ae4a096dd3a827c40035de64edb',
    transactions: 1,
    rejected_transactions: 0,
  },
  {
    height: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    block_hash: '5ace3d1b36d5f659bdf95e5a56e110331f2089149ddcaa3c21554bd7aa8f920d',
    transactions: 2,
    rejected_transactions: 0,
  },
];

const fakeDomains: DomainDto[] = [
  {
    id: 'genesis',
    accounts: [
      {
        id: 'genesis@genesis',
        assets: [],
        metadata: {},
        roles: [],
      },
    ],
    logo: null,
    metadata: {},
    asset_definitions: [],
    triggers: 0,
  },
  {
    id: 'wonderland',
    accounts: [
      {
        id: 'alice@wonderland',
        assets: [
          {
            account_id: 'alice@wonderland',
            definition_id: 'cabbage#garden_of_live_flowers',
            value: {
              t: 'Quantity',
              c: '44',
            },
          },
          {
            account_id: 'alice@wonderland',
            definition_id: 'rose#wonderland',
            value: {
              t: 'Quantity',
              c: '13',
            },
          },
        ],
        metadata: {
          key: {
            String: 'value',
          },
        },
        roles: [],
      },
      {
        id: 'bob@wonderland',
        assets: [],
        metadata: {
          key: {
            String: 'value',
          },
        },
        roles: [],
      },
    ],
    logo: null,
    metadata: {
      key: {
        String: 'value',
      },
    },
    asset_definitions: [
      {
        id: 'rose#wonderland',
        value_type: 'Quantity',
        mintable: 'Infinitely',
      },
    ],
    triggers: 0,
  },
  {
    id: 'garden_of_live_flowers',
    accounts: [
      {
        id: 'carpenter@garden_of_live_flowers',
        assets: [],
        metadata: {},
        roles: [],
      },
    ],
    logo: null,
    metadata: {},
    asset_definitions: [
      {
        id: 'cabbage#garden_of_live_flowers',
        value_type: 'Quantity',
        mintable: 'Infinitely',
      },
    ],
    triggers: 0,
  },
];

const fakeTransactions: TransactionDto[] = [
  {
    hash: 'e30f700ce344b16cb13c2ed56e08ea2e61f7a5e9410c7d5a0f7e5150b105f5cb',
    block_hash: '5752a85e966936e65d0cb31f2b0e8d8705f81ae4a096dd3a827c40035de64edb',
    block_height: 0,
    payload: {
      account_id: 'alice@wonderland',
      instructions: {
        t: 'Instructions',
        c: [
          '040d08031c636162626167655867617264656e5f6f665f6c6976655f666c6f776572730c626f6228776f6e6465726c616e640d1300010000000d080114616c69636528776f6e6465726c616e64',
        ],
      },
      creation_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      time_to_live_ms: 100000,
      nonce: null,
      metadata: {},
    },
    signatures: [
      {
        public_key: 'ed01207233BFC89DCBD68C19FDE6CE6158225298EC1131B6A130D1AEB454C1AB5183C0',
        payload:
          '010195f10b88ccb007c636148fec46913ce7e0b0ff72eba6383d5ff619cec7a8f0992d8ceae2e11ea5a478a9c5ee00ac59cb52d82331820f2dbd488c237c50c57704',
      },
    ],
    rejection_reason: '0200a043616e2774207472616e7366657220617373657473206f6620616e6f74686572206163636f756e74',
  },
  {
    hash: '1657ac43b7bacffcb1481b0cfc22cb61781d9e017e8f41fc030f73daec015631',
    block_hash: '5ace3d1b36d5f659bdf95e5a56e110331f2089149ddcaa3c21554bd7aa8f920d',
    block_height: 0,
    payload: {
      account_id: 'genesis@genesis',
      instructions: {
        t: 'Instructions',
        c: [
          '000d090028776f6e6465726c616e6400040c6b6579011476616c7565',
          '000d090114616c69636528776f6e6465726c616e640400807233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0040c6b6579011476616c7565',
          '000d09010c626f6228776f6e6465726c616e640400807233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c0040c6b6579011476616c7565',
          '000d090210726f736528776f6e6465726c616e6400000000',
          '000d09005867617264656e5f6f665f6c6976655f666c6f776572730000',
          '000d09012463617270656e7465725867617264656e5f6f665f6c6976655f666c6f776572730400807233bfc89dcbd68c19fde6ce6158225298ec1131b6a130d1aeb454c1ab5183c000',
          '000d09021c636162626167655867617264656e5f6f665f6c6976655f666c6f7765727300000000',
          '020d13000d0000000d080310726f736528776f6e6465726c616e6414616c69636528776f6e6465726c616e64',
          '020d13002c0000000d08031c636162626167655867617264656e5f6f665f6c6976655f666c6f7765727314616c69636528776f6e6465726c616e64',
          '0a0d0d4863616e5f7365745f706172616d6574657273000d080114616c69636528776f6e6465726c616e64',
          '072c0e0d090c584d61785472616e73616374696f6e73496e426c6f636b130100020000000000000e0d090c24426c6f636b54696d651301d0070000000000000e0d090c3c436f6d6d697454696d654c696d69741301a00f0000000000000e0d090c445472616e73616374696f6e4c696d69747306001000000000000000004000000000000e0d090c5857535641737365744d657461646174614c696d6974730500001000001000000e0d090c805753564173736574446566696e6974696f6e4d657461646174614c696d6974730500001000001000000e0d090c605753564163636f756e744d657461646174614c696d6974730500001000001000000e0d090c5c575356446f6d61696e4d657461646174614c696d6974730500001000001000000e0d090c505753564964656e744c656e6774684c696d6974730701000000800000000e0d090c345741534d4675656c4c696d69741301c0f35e01000000000e0d090c345741534d4d61784d656d6f727913010000401f00000000',
          '000d090354414c4943455f4d455441444154415f414343455353089063616e5f72656d6f76655f6b65795f76616c75655f696e5f757365725f6163636f756e7404286163636f756e745f6964080114616c69636528776f6e6465726c616e648463616e5f7365745f6b65795f76616c75655f696e5f757365725f6163636f756e7404286163636f756e745f6964080114616c69636528776f6e6465726c616e64',
        ],
      },
      creation_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      time_to_live_ms: null,
      nonce: null,
      metadata: {},
    },
    signatures: [
      {
        public_key: 'ed01207233BFC89DCBD68C19FDE6CE6158225298EC1131B6A130D1AEB454C1AB5183C0',
        payload:
          '01015739ee59f8bde433dae7d09b906ad7aaabc1767094cf63850741904d7ae9fda2ffbe2078dde75b7461b4e76e48aee0a0c62fa44545e1f51ca95c4fe9c54c480e',
      },
    ],
  },
  {
    hash: '09046898246c6b57fbc37f6ab157257f47bff9e165286f55a8c10e05058732e7',
    block_hash: '5ace3d1b36d5f659bdf95e5a56e110331f2089149ddcaa3c21554bd7aa8f920d',
    block_height: 0,
    payload: {
      account_id: 'genesis@genesis',
      instructions: {
        t: 'Instructions',
        c: ['000d090028776f6e6465726c616e6400040c6b6579011476616c7565'],
      },
      creation_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      time_to_live_ms: null,
      nonce: null,
      metadata: {},
    },
    signatures: [
      {
        public_key: 'ed01207233BFC89DCBD68C19FDE6CE6158225298EC1131B6A130D1AEB454C1AB5183C0',
        payload:
          '01019896e31b5a191ab4c8d07c31c490a66053e88326fd02c7e4e48b4fc26c8bc909105251e417a03bb9116c9fa25c345e3d68a390e5bcc1e314203eee6ba0c61e00',
      },
    ],
  },
];
