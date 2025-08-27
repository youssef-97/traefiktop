import { useInput } from "ink";
import { useReducer } from "react";
import type { Router } from "../types/traefik";
import { initialState, tuiReducer } from "./reducer";

export const useTui = (routers: Router[]) => {
  const [state, dispatch] = useReducer(tuiReducer, initialState);

  const filteredRouters = routers.filter((router) =>
    router.name.toLowerCase().includes(state.searchQuery.toLowerCase()),
  );

  useInput((input, key) => {
    if (state.mode === "normal") {
      if (input === "/") {
        dispatch({ type: "SET_MODE", payload: "search" });
        return;
      }

      if (input === "q" || (key.ctrl && input === "c")) {
        process.exit(0);
      }

      if (key.upArrow || input === "k") {
        dispatch({
          type: "SET_SELECTED_ROUTER",
          payload: Math.max(0, state.selectedRouter - 1),
        });
      }

      if (key.downArrow || input === "j") {
        dispatch({
          type: "SET_SELECTED_ROUTER",
          payload: Math.min(
            filteredRouters.length - 1,
            state.selectedRouter + 1,
          ),
        });
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
