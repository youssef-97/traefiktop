import { produce } from "immer";

export type TuiMode = "normal" | "search";

export interface TuiState {
  mode: TuiMode;
  searchQuery: string;
  selectedRouter: number;
  topIndex: number;
  sortMode: "name" | "status";
}

export type TuiAction =
  | { type: "SET_MODE"; payload: TuiMode }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_ROUTER"; payload: number }
  | { type: "SET_SORT_MODE"; payload: "name" | "status" }
  | { type: "TOGGLE_SORT_MODE" }
  | {
      type: "MOVE_UP";
      payload: {
        filteredRoutersLength: number;
        heights: number[];
        availableHeight: number;
        footerHeight: number;
      };
    }
  | {
      type: "MOVE_DOWN";
      payload: {
        filteredRoutersLength: number;
        heights: number[];
        availableHeight: number;
        footerHeight: number;
      };
    }
  | {
      type: "PAGE_DOWN";
      payload: {
        heights: number[];
        availableHeight: number;
        footerHeight: number;
      };
    }
  | {
      type: "PAGE_UP";
      payload: {
        heights: number[];
        availableHeight: number;
        footerHeight: number;
      };
    }
  | { type: "GO_TOP" }
  | {
      type: "GO_BOTTOM";
      payload: {
        heights: number[];
        availableHeight: number;
        footerHeight: number;
      };
    };

export const initialState: TuiState = {
  mode: "normal",
  searchQuery: "",
  selectedRouter: 0,
  topIndex: 0,
  sortMode: "status",
};

export const tuiReducer = produce((draft: TuiState, action: TuiAction) => {
  // Helper to compute last fully visible index for a given topIndex
  const computeWindowEnd = (
    topIndex: number,
    heights: number[],
    availableHeight: number,
    footerHeight: number,
  ) => {
    let used = 0;
    let count = 0;
    const n = heights.length;
    for (let i = topIndex; i < n; i++) {
      const inter = count > 0 ? 1 : 0; // spacing between items
      const needsFooter = topIndex > 0 || i < n - 1;
      const maxUsable = availableHeight - (needsFooter ? footerHeight : 0);
      const wouldUse = used + inter + heights[i];
      if (wouldUse > maxUsable) break;
      used += inter + heights[i];
      count++;
    }
    return count > 0 ? topIndex + count - 1 : topIndex;
  };

  const includesIndexFully = (
    targetIndex: number,
    topIndex: number,
    heights: number[],
    availableHeight: number,
    footerHeight: number,
  ) => {
    const end = computeWindowEnd(
      topIndex,
      heights,
      availableHeight,
      footerHeight,
    );
    if (targetIndex < topIndex || targetIndex > end) return false;
    // Quick check for clipping: ensure that if target is the last in window, it still fits entirely
    // We recompute used height up to target.
    let used = 0;
    const n = heights.length;
    for (let i = topIndex; i <= targetIndex && i < n; i++) {
      const inter = i > topIndex ? 1 : 0;
      const needsFooter = topIndex > 0 || targetIndex < n - 1;
      const maxUsable = availableHeight - (needsFooter ? footerHeight : 0);
      const wouldUse = used + inter + heights[i];
      if (wouldUse > maxUsable) return false;
      used = wouldUse;
    }
    return true;
  };

  const adjustTopForIndex = (
    targetIndex: number,
    _currentTop: number,
    heights: number[],
    availableHeight: number,
    footerHeight: number,
  ) => {
    // Try to move window up to show as much context above as possible while keeping target fully visible
    let top = targetIndex;
    // Walk upwards while we can still include target fully
    while (top > 0) {
      const candidate = top - 1;
      if (
        includesIndexFully(
          targetIndex,
          candidate,
          heights,
          availableHeight,
          footerHeight,
        )
      ) {
        top = candidate;
      } else {
        break;
      }
    }
    return top;
  };

  switch (action.type) {
    case "SET_MODE":
      draft.mode = action.payload;
      break;
    case "SET_SEARCH_QUERY":
      draft.searchQuery = action.payload;
      // Reset selection to top when search changes
      draft.selectedRouter = 0;
      draft.topIndex = 0;
      break;
    case "SET_SELECTED_ROUTER":
      draft.selectedRouter = action.payload;
      break;
    case "SET_SORT_MODE":
      draft.sortMode = action.payload;
      draft.selectedRouter = 0;
      draft.topIndex = 0;
      break;
    case "TOGGLE_SORT_MODE":
      draft.sortMode = draft.sortMode === "name" ? "status" : "name";
      draft.selectedRouter = 0;
      draft.topIndex = 0;
      break;
    case "MOVE_DOWN": {
      const { filteredRoutersLength, heights, availableHeight, footerHeight } =
        action.payload;
      if (draft.selectedRouter < filteredRoutersLength - 1) {
        const newIndex = draft.selectedRouter + 1;
        // If moving down goes out of view, bump topIndex until fully visible
        let top = draft.topIndex;
        while (
          !includesIndexFully(
            newIndex,
            top,
            heights,
            availableHeight,
            footerHeight,
          ) &&
          top < newIndex
        ) {
          top += 1;
        }
        draft.topIndex = top;
        draft.selectedRouter = newIndex;
      }
      break;
    }
    case "MOVE_UP":
      if (draft.selectedRouter > 0) {
        const { heights, availableHeight, footerHeight } = action.payload;
        const newIndex = draft.selectedRouter - 1;
        // If moving up goes out of view, reduce topIndex until fully visible
        let top = draft.topIndex;
        while (
          !includesIndexFully(
            newIndex,
            top,
            heights,
            availableHeight,
            footerHeight,
          ) &&
          top > 0
        ) {
          top -= 1;
        }
        draft.topIndex = top;
        draft.selectedRouter = newIndex;
      }
      break;
    case "PAGE_DOWN": {
      const { heights, availableHeight, footerHeight } = action.payload;
      const end = computeWindowEnd(
        draft.topIndex,
        heights,
        availableHeight,
        footerHeight,
      );
      // Move selection to end of current window
      draft.selectedRouter = end;
      // Prepare next window start if possible
      if (end < heights.length - 1) {
        const nextTop = end + 1;
        draft.topIndex = adjustTopForIndex(
          Math.min(heights.length - 1, nextTop + 1),
          nextTop,
          heights,
          availableHeight,
          footerHeight,
        );
      }
      break;
    }
    case "PAGE_UP": {
      const { heights, availableHeight, footerHeight } = action.payload;
      // Move selection to current top
      draft.selectedRouter = draft.topIndex;
      // Move window up by trying to show more above
      if (draft.topIndex > 0) {
        const prevTop = Math.max(0, draft.topIndex - 1);
        draft.topIndex = adjustTopForIndex(
          prevTop,
          prevTop,
          heights,
          availableHeight,
          footerHeight,
        );
      }
      break;
    }
    case "GO_TOP":
      draft.selectedRouter = 0;
      draft.topIndex = 0;
      break;
    case "GO_BOTTOM": {
      const { heights, availableHeight, footerHeight } = action.payload;
      const last = heights.length - 1;
      draft.selectedRouter = Math.max(0, last);
      draft.topIndex = adjustTopForIndex(
        last,
        last,
        heights,
        availableHeight,
        footerHeight,
      );
      break;
    }
  }
});
