import { Box, Text, useStdout } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useTraefikData } from "../hooks/useTraefikData";
import { useTui } from "../tui/useTui";
import { getRouterItemHeight } from "../utils/layout";
import RouterItem from "./RouterItem";

interface RoutersListProps {
  apiUrl: string;
  useTraefikDataHook?: typeof useTraefikData;
}

const RoutersList: React.FC<RoutersListProps> = ({
  apiUrl,
  useTraefikDataHook = useTraefikData,
}) => {
  const { stdout } = useStdout();
  const terminalWidth = stdout.columns;

  // State and data fetching
  const {
    routers: allRouters,
    services: allServices,
    loading,
    error,
  } = useTraefikDataHook(apiUrl);

  // Calculate available screen space
  const headerHeight = 1; // Search bar
  const footerHeight = 1; // Navigation footer (only shown if scrolling needed)
  const availableHeight = stdout.rows - headerHeight;

  // Calculate how many items can fit on screen for initial estimate
  const estimatedItemHeight = 3; // Average estimate for router + services
  const estimatedVisibleCount = Math.max(
    1,
    Math.floor(availableHeight / estimatedItemHeight),
  );

  // Get TUI state and filtered routers (must be called at top level)
  const { state, dispatch, filteredRouters } = useTui(
    allRouters,
    estimatedVisibleCount,
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  // Calculate visible routers based on dynamic height and topIndex
  const visibleRouters: typeof filteredRouters = [];
  let usedLines = 0;

  for (let i = state.topIndex; i < filteredRouters.length; i++) {
    const router = filteredRouters[i];
    const itemHeight = getRouterItemHeight(router, allServices, terminalWidth);

    // Check if we need to reserve space for footer
    const needsFooter =
      filteredRouters.length > 1 &&
      (state.topIndex > 0 || i < filteredRouters.length - 1);
    const maxUsableHeight = needsFooter
      ? availableHeight - footerHeight
      : availableHeight;

    if (usedLines + itemHeight > maxUsableHeight) {
      break; // This item would overflow the screen
    }

    visibleRouters.push(router);
    usedLines += itemHeight;
  }

  // Ensure at least one item is visible (even if it overflows on very small screens)
  if (visibleRouters.length === 0 && filteredRouters.length > 0) {
    visibleRouters.push(filteredRouters[state.topIndex]);
  }

  return (
    <Box flexDirection="column">
      {/* Always visible header */}
      <Box backgroundColor="gray" paddingX={1}>
        {state.mode === "search" ? (
          <>
            <Text>Filter: </Text>
            <TextInput
              value={state.searchQuery}
              onChange={(query) =>
                dispatch({ type: "SET_SEARCH_QUERY", payload: query })
              }
            />
          </>
        ) : (
          <Text>🔍 Press / to search ({filteredRouters.length} routers)</Text>
        )}
      </Box>

      {/* Content */}
      {visibleRouters.map((router, index) => {
        const absoluteIndex = state.topIndex + index;
        return (
          <RouterItem
            key={router.name}
            router={router}
            services={allServices}
            isSelected={absoluteIndex === state.selectedRouter}
            terminalWidth={terminalWidth}
          />
        );
      })}

      {/* Footer with navigation info */}
      {filteredRouters.length > visibleRouters.length && (
        <Box justifyContent="center" backgroundColor="gray">
          <Text>
            {state.topIndex > 0 && "▲"} {state.topIndex + 1}-
            {state.topIndex + visibleRouters.length} of {filteredRouters.length}{" "}
            {state.topIndex + visibleRouters.length < filteredRouters.length &&
              "▼"}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default RoutersList;
