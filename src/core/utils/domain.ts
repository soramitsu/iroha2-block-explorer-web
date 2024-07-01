import type { DomainDto } from '@/api/domains';

function countCryptos(domain: DomainDto): number {
  return domain.asset_definitions.reduce((sum, ad) => (ad.value_type !== 'Store' ? sum + 1 : sum), 0);
}

function countNFTs(domain: DomainDto): number {
  return domain.asset_definitions.reduce((sum, ad) => (ad.value_type === 'Store' ? sum + 1 : sum), 0);
}

export const domainModel = {
  countCryptos,
  countNFTs,
};
