export function assertUnreachable(message: string): never {
  throw new Error(message);
}
