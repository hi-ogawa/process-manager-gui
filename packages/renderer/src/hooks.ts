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
