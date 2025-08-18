import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { createLink } from "@tanstack/react-router";

type MouseDownLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

const MouseDownLinkComponent = forwardRef<
  HTMLAnchorElement,
  MouseDownLinkProps
>(({ onMouseDown, onClick, ...rest }, ref) => {
  function handleMouseDown(e: React.MouseEvent) {
    if (onMouseDown) {
      // @ts-expect-error -- taken from ztunes
      onMouseDown(e);
    }
    if (!e.defaultPrevented) {
      if (onClick) {
        // @ts-expect-error -- taken from ztunes
        onClick(e);
      }
    }
  }

  return (
    <a ref={ref} {...rest} onClick={onClick} onMouseDown={handleMouseDown} />
  );
});
MouseDownLinkComponent.displayName = "MouseDownLinkComponent";

export const Link = createLink(MouseDownLinkComponent);
