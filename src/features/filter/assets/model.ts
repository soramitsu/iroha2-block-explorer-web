import type { TabItem } from '../index';

export type TabAssets = 'crypto' | 'nft';

export const ASSETS_OPTIONS: TabItem<TabAssets>[] = [
  { i18nKey: 'assets.cryptos', value: 'crypto' },
  { i18nKey: 'assets.nfts', value: 'nft' },
];
