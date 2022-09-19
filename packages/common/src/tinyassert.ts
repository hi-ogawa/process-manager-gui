export class TinyAssertionError extends Error {
  constructor(message?: string, stackStartFunction?: Function) {
    super(message);
    if ("captureStackTrace" in Error) {
      // @ts-ignore-error
      Error.captureStackTrace(this, stackStartFunction ?? TinyAssertionError);
    }
  }
}

export function tinyassert(value: any, message?: string): asserts value {
  if (value) {
    return;
  }
  throw new TinyAssertionError(message, tinyassert);
}
