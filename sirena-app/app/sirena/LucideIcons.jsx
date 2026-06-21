"use client";

import { useEffect } from "react";

// Converts any <i data-lucide="..."> into an inline SVG, including ones added
// by subtrees that re-render independently of the shell (e.g. modals opened
// from screen-level state). A plain post-render effect in the shell only
// catches icons present when the shell itself re-renders, which misses those.
export function LucideIcons() {
  useEffect(() => {
    let frame = null;
    const refresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        window.lucide?.createIcons();
      });
    };
    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
