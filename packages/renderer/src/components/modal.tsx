import {
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react-dom-interactions";
import { tinyassert } from "@hiogawa/utils";
import { useId } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { cls } from "../misc";

// ts-prune-ignore-next
export function Modal(props: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { floating, context } = useFloating({
    open: props.open,
    onOpenChange: (open) => {
      // we are supposed to get only `open = false` via `useDismiss`
      tinyassert(!open);
      props.onClose();
    },
  });
  const { getFloatingProps } = useInteractions([useDismiss(context)]);
  const id = useId();

  return (
    <FloatingPortal id={id}>
      {props.open && (
        <RemoveScroll className="fixed inset-0 flex px-4 py-8 overflow-auto bg-black bg-opacity-50 z-10">
          <div
            {...getFloatingProps({
              ref: floating,
              className: cls("w-full m-auto", props.className), // expect max-w-... passed via props
            })}
          >
            {props.children}
          </div>
        </RemoveScroll>
      )}
    </FloatingPortal>
  );
}
