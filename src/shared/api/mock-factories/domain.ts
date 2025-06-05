import { randDomainName } from '@ngneat/falso';
import { makeAccount } from './account';
import { makeAssetDefinition } from './asset';
import { list } from './utils';

export function makeDomain(id?: string): Domain {
  return {
    id: id ?? randDomainName(),
    accounts: list(makeAccount),
    asset_definitions: list(makeAssetDefinition),
    logo: null,
    metadata: {},
    triggers: 0,
  };
}
