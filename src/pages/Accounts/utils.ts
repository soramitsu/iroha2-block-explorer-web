import { pagination } from '@/shared/api/mock-factories/utils';
import type { TableAsset } from './types';
import { defineAsyncComponent } from 'vue';

export async function getFakeAssets(params?: PaginationParams): Promise<Paginated<TableAsset>> {
  return pagination(fakeAssets, params);
}

export const fakeAssets: TableAsset[] = [
  {
    symbol: 'XOR',
    name: 'Sora',
    price: 0.00001321,
    amount: 100231,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-XOR-16.svg')),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 4325.01,
    amount: 360,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-eth-blue-16.svg')),
  },
  {
    symbol: 'Pswap',
    name: 'Polkaswap',
    price: 245,
    amount: 2000,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-PSWAP-24.svg')),
  },
  {
    symbol: 'Soshib',
    name: 'Soshiba',
    price: 0.00005475,
    amount: 589738956,
    icon: null,
  },
  {
    symbol: 'XOR',
    name: 'Sora',
    price: 245,
    amount: 200,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-XOR-16.svg')),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 4325.01,
    amount: 360,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-eth-blue-16.svg')),
  },
  {
    symbol: 'Pswap',
    name: 'Polkaswap',
    price: 245,
    amount: 2000,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-PSWAP-24.svg')),
  },
  {
    symbol: 'Soshib',
    name: 'Soshiba',
    price: 0.00005475,
    amount: 589738956,
    icon: null,
  },
  {
    symbol: 'Pswap',
    name: 'Polkaswap',
    price: 245,
    amount: 2000,
    icon: defineAsyncComponent(() => import('@soramitsu-ui/icons/icomoon/finance-PSWAP-24.svg')),
  },
  {
    symbol: 'Soshib',
    name: 'Soshiba',
    price: 0.00005475,
    amount: 589738956,
    icon: null,
  },
];
