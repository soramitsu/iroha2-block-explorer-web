import { rand, randDomainName, randEmail, randGitBranch, randNumber } from '@ngneat/falso';

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
  const t = randomType();
  let c;

  switch (t) {
    case 'Store': c = '🔑: 0'; break;
    case 'Fixed': c = String(randNumber({ fraction: 6 })); break;
    default: c = String(randNumber()); break;
  }

  return { t, c } as AssetValue;
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
