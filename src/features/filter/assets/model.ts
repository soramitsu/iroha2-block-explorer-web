import type { TabItem } from '../index';

export type TabAssets = 'assets' | 'nft';

export const ASSETS_OPTIONS: TabItem<TabAssets>[] = [
  { i18nKey: 'assets.numerics', value: 'assets' },
  { i18nKey: 'assets.nfts', value: 'nft' },
];
