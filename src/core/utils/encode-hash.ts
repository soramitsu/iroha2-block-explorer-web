export function encodeHash(value: string) {
  return value.replace(/#/g, '%23');
}
