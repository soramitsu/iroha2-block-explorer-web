import { randEmail } from '@ngneat/falso';
import { makeAsset } from './asset';
import { list } from './utils';

export function makeAccount(id?: string): Account {
  return {
    id: id ?? randEmail(),
    assets: list(makeAsset),
    metadata: {},
    roles: [],
  };
}
