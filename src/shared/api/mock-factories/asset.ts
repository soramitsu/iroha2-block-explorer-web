import { rand, randDomainName, randEmail, randGitBranch, randNumber } from '@ngneat/falso';
import { match } from 'ts-pattern';

function randomType(): AssetValueType {
  return rand(['Quantity', 'BigQuantity', 'Fixed', 'Store']);
}

function randomMintable(): Mintable {
  return rand(['Once', 'Infinitely', 'Not']);
}

function makeDefinitionId() {
  return `${randGitBranch()}#${randDomainName()}`;
}

export function makeAssetValue(): AssetValue {
  return match(randomType())
    .with('Store', (t) => ({ t, c: {} }))
    .with('Fixed', (t) => ({ t, c: String(randNumber({ fraction: 6 })) }))
    .with('Quantity', 'BigQuantity', (t) => ({ t, c: String(randNumber()) }))
    .exhaustive();
}

export function makeAsset(account_id?: string, definition_id?: string): Asset {
  return {
    account_id: account_id ?? randEmail(),
    definition_id: definition_id ?? makeDefinitionId(),
    value: makeAssetValue(),
  };
}

export function makeAssetDefinition(id?: string): AssetDefinition {
  return {
    id: id ?? makeDefinitionId(),
    value_type: randomType(),
    mintable: randomMintable(),
  };
}
