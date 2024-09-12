export function getMetadata(obj: object) {
  const str = JSON.stringify(obj);

  return str === '{}' ? null : str;
}
