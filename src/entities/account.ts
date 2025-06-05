function countCryptos(account: Account): number {
  return account.assets
    .reduce((sum, a) => a.value.t !== 'Store' ? sum + 1 : sum, 0);
};

function countNFTs(account: Account): number {
  return account.assets
    .reduce((sum, a) => a.value.t === 'Store' ? sum + 1 : sum, 0);
}

export const accountModel = {
  countCryptos,
  countNFTs,
};
