import React from "react";

export function useDocumentEvent<K extends keyof DocumentEventMap>(
  type: K,
  handler: (ev: DocumentEventMap[K]) => any
) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    const handler = (e: DocumentEventMap[K]) => handlerRef.current(e);
    document.addEventListener(type, handler);
    return () => document.removeEventListener(type, handler);
  }, []);
}

export function useMutationObserverCallback<T extends Element>(
  options: MutationObserverInit,
  callback: (element: T, value: MutationRecord[]) => void
): React.RefCallback<T> {
  const observerRef = React.useRef<MutationObserver>();
  const callbackRef = React.useRef<typeof callback>(callback);
  callbackRef.current = callback;

  return React.useCallback((el) => {
    if (el) {
      const observer = new MutationObserver((records) => {
        callbackRef.current(el, records);
      });
      observer.observe(el, options);
      observerRef.current = observer;
    } else {
      observerRef.current?.disconnect();
    }
  }, []);
}

// https://github.com/gregberge/react-merge-refs/blob/main/src/index.tsx
export function useMergeRefs<T = any>(
  ...refs: (React.MutableRefObject<T | null> | React.RefCallback<T>)[]
): React.RefCallback<T> {
  const stableRefs = React.useRef(refs);
  stableRefs.current = refs;

  return React.useCallback((value) => {
    for (const ref of stableRefs.current) {
      if (typeof ref === "function") {
        ref(value);
      } else {
        ref.current = value;
      }
    }
  }, []);
}
