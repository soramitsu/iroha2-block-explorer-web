import type { TransactionStatus } from '@/shared/api/schemas';

export type Status = TransactionStatus | null;
export type TabDefaultScreen = 'All' | 'Transfer' | 'Mint' | 'Burn' | 'Grant' | 'Revoke';
export type TabBlocksScreen = 'Transactions' | 'Transfer' | 'Mint' | 'Burn' | 'Grant' | 'Revoke';
export type TabInstructions =
  | 'All'
  | 'Register'
  | 'Unregister'
  | 'Mint'
  | 'Burn'
  | 'Transfer'
  | 'SetKeyValue'
  | 'RemoveKeyValue'
  | 'Grant'
  | 'Revoke'
  | 'ExecuteTrigger'
  | 'SetParameter'
  | 'Upgrade'
  | 'Log'
  | 'Custom';
export type TabAssetsSort = 'recent' | 'value';

export interface TabItem<T = string> {
  i18nKey: string
  value: T
}

export const sortOptions: TabItem<TabAssetsSort>[] = [
  { i18nKey: 'sort.mostRecent', value: 'recent' },
  { i18nKey: 'sort.mostValue', value: 'value' },
];

export const blockOptions: TabItem<TabBlocksScreen>[] = [
  { i18nKey: 'transactions.transactions', value: 'Transactions' },
  { i18nKey: 'transactions.transfers', value: 'Transfer' },
  { i18nKey: 'transactions.mints', value: 'Mint' },
  { i18nKey: 'transactions.burns', value: 'Burn' },
  { i18nKey: 'transactions.grants', value: 'Grant' },
  { i18nKey: 'transactions.revokes', value: 'Revoke' },
];

export const defaultOptions: TabItem<TabDefaultScreen>[] = [
  { i18nKey: 'transactions.all', value: 'All' },
  { i18nKey: 'transactions.transfers', value: 'Transfer' },
  { i18nKey: 'transactions.mints', value: 'Mint' },
  { i18nKey: 'transactions.burns', value: 'Burn' },
  { i18nKey: 'transactions.grants', value: 'Grant' },
  { i18nKey: 'transactions.revokes', value: 'Revoke' },
];

export const instructionOptions: TabItem<TabInstructions>[] = [
  { i18nKey: 'transactions.all', value: 'All' },
  { i18nKey: 'transactions.register', value: 'Register' },
  { i18nKey: 'transactions.unregister', value: 'Unregister' },
  { i18nKey: 'transactions.mints', value: 'Mint' },
  { i18nKey: 'transactions.burns', value: 'Burn' },
  { i18nKey: 'transactions.transfers', value: 'Transfer' },
  { i18nKey: 'transactions.setKeyValue', value: 'SetKeyValue' },
  { i18nKey: 'transactions.removeKeyValue', value: 'RemoveKeyValue' },
  { i18nKey: 'transactions.grants', value: 'Grant' },
  { i18nKey: 'transactions.revokes', value: 'Revoke' },
  { i18nKey: 'transactions.executeTrigger', value: 'ExecuteTrigger' },
  { i18nKey: 'transactions.setParameter', value: 'SetParameter' },
  { i18nKey: 'transactions.upgrade', value: 'Upgrade' },
  { i18nKey: 'transactions.log', value: 'Log' },
  { i18nKey: 'transactions.custom', value: 'Custom' },
];
