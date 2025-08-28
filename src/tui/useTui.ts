import { useInput } from "ink";
import { useReducer, useMemo, useRef } from "react";
import type { Router } from "../types/traefik";
import { initialState, tuiReducer } from "./reducer";
import type { Service } from "../types/traefik";
import { getRouterItemHeight } from "../utils/layout";

export const useTui = (
  routers: Router[],
  services: Service[],
  availableHeight: number,
) => {
  const [state, dispatch] = useReducer(tuiReducer, initialState);

  const filteredRouters = routers.filter((router) =>
    router.name.toLowerCase().includes(state.searchQuery.toLowerCase()),
  );

  // Precompute full item heights for filtered routers
  const heights = useMemo(
    () => filteredRouters.map((r) => getRouterItemHeight(r, services)),
    [filteredRouters, services],
  );

  const footerHeight = 1;

  // Simple key buffer to detect "gg"
  const lastKeyRef = useRef<{ key: string; ts: number } | null>(null);

  useInput((input, key) => {
    // Handle Ctrl+C and quit in any mode
    if (input === "q" || (key.ctrl && input === "c")) {
      process.exit(0);
    }

    if (state.mode === "normal") {
      if (input === "/") {
        dispatch({ type: "SET_MODE", payload: "search" });
        return;
      }

      if (key.upArrow || input === "k") {
        dispatch({
          type: "MOVE_UP",
          payload: {
            filteredRoutersLength: filteredRouters.length,
            heights,
            availableHeight,
            footerHeight,
          },
        });
      }

      if (key.downArrow || input === "j") {
        dispatch({
          type: "MOVE_DOWN",
          payload: {
            filteredRoutersLength: filteredRouters.length,
            heights,
            availableHeight,
            footerHeight,
          },
        });
      }

      // PageDown: try key.pageDown, Ctrl+f, or space
      if ((key as any).pageDown || (key.ctrl && input === "f") || input === " ") {
        dispatch({
          type: "PAGE_DOWN",
          payload: { heights, availableHeight, footerHeight },
        });
      }

      // PageUp: try key.pageUp or Ctrl+b
      if ((key as any).pageUp || (key.ctrl && input === "b")) {
        dispatch({
          type: "PAGE_UP",
          payload: { heights, availableHeight, footerHeight },
        });
      }

      // Home/End
      if ((key as any).home) {
        dispatch({ type: "GO_TOP" });
      }
      if ((key as any).end) {
        dispatch({
          type: "GO_BOTTOM",
          payload: { heights, availableHeight, footerHeight },
        });
      }

      // Vim-style gg (go top) and G (go bottom)
      if (input === "g") {
        const now = Date.now();
        if (lastKeyRef.current && lastKeyRef.current.key === "g" && now - lastKeyRef.current.ts < 600) {
          dispatch({ type: "GO_TOP" });
          lastKeyRef.current = null;
        } else {
          lastKeyRef.current = { key: "g", ts: now };
        }
      } else if (input === "G") {
        dispatch({
          type: "GO_BOTTOM",
          payload: { heights, availableHeight, footerHeight },
        });
      } else if (input !== "g") {
        // Reset buffer if other keys pressed
        lastKeyRef.current = null;
      }

      if (key.escape) {
        dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
      }
    }

    if (state.mode === "search") {
      if (key.escape) {
        dispatch({ type: "SET_MODE", payload: "normal" });
        dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
      }

      if (key.return) {
        dispatch({ type: "SET_MODE", payload: "normal" });
      }
    }
  });

  return { state, dispatch, filteredRouters };
};
