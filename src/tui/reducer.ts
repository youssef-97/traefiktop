import { produce } from "immer";

export type TuiMode = "normal" | "search";

export interface TuiState {
  mode: TuiMode;
  searchQuery: string;
  selectedRouter: number;
}

export type TuiAction =
  | { type: "SET_MODE"; payload: TuiMode }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_SELECTED_ROUTER"; payload: number };

export const initialState: TuiState = {
  mode: "normal",
  searchQuery: "",
  selectedRouter: 0,
};

export const tuiReducer = produce((draft: TuiState, action: TuiAction) => {
  switch (action.type) {
    case "SET_MODE":
      draft.mode = action.payload;
      break;
    case "SET_SEARCH_QUERY":
      draft.searchQuery = action.payload;
      break;
    case "SET_SELECTED_ROUTER":
      draft.selectedRouter = action.payload;
      break;
  }
});
