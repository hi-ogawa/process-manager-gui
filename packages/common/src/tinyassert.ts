// https://github.com/hi-ogawa/js-utils/blob/ac33b34f1802843e619caac26c575184304b0de8/packages/tinyassert/src/index.ts

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
