export function getAssetDomain(assetId: string) {
  return assetId.split('@')[1];
}

export function getAssetName(assetId: string) {
  return assetId.split('#')[0];
}
