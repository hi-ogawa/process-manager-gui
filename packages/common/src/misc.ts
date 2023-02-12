export function fromEntries<K extends string, V>(
  pairs: [K, V][]
): Record<K, V> {
  return Object.fromEntries(pairs) as any;
}

// https://github.com/microsoft/TypeScript/issues/48100
export type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

export function staticAssert<_ extends true>() {}

export const MESSAGE_PORT_HANDSHAKE = "MESSAGE_PORT_HANDSHAKE";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
