export function parseMetadata(obj: Record<string, any>) {
  return Object.keys(obj).length ? obj : null;
}
