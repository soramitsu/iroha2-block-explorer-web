export function assertUnreachable(x: never): never {
  throw new Error(`Incorrect BaseHash props.type value : ${x}`);
}
