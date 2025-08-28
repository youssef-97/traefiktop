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
  const availableHeight = stdout.rows - headerHeight - 1;

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

  // Helper to build a window of visible routers starting at a given index
  const buildWindow = (startIndex: number) => {
    const windowRouters: typeof filteredRouters = [];
    let windowUsedLines = 0;

    for (let i = startIndex; i < filteredRouters.length; i++) {
      const router = filteredRouters[i];
      const itemHeight = getRouterItemHeight(router, allServices);

      // Reserve space for footer only if there will be more items above or below
      const needsFooter =
        filteredRouters.length > 1 && (startIndex > 0 || i < filteredRouters.length - 1);
      const maxUsableHeight = needsFooter
        ? availableHeight - footerHeight
        : availableHeight;

      if (windowUsedLines + itemHeight > maxUsableHeight) {
        break;
      }

      windowRouters.push(router);
      windowUsedLines += itemHeight;
    }

    // Ensure at least one item is visible (even if it overflows on very small screens)
    if (windowRouters.length === 0 && filteredRouters.length > 0 && startIndex < filteredRouters.length) {
      windowRouters.push(filteredRouters[startIndex]);
    }

    return { windowRouters, windowUsedLines };
  };

  // First, build from the current topIndex
  let startIndex = Math.min(state.topIndex, Math.max(0, filteredRouters.length - 1));
  let { windowRouters: visibleRouters, windowUsedLines } = buildWindow(startIndex);

  // If the selected router is not within the window (e.g., due to dynamic heights),
  // rebuild the window anchored at the selected item so it becomes visible.
  const lastAbsoluteIndex = startIndex + visibleRouters.length - 1;
  if (
    filteredRouters.length > 0 &&
    (state.selectedRouter < startIndex || state.selectedRouter > lastAbsoluteIndex)
  ) {
    startIndex = Math.min(state.selectedRouter, Math.max(0, filteredRouters.length - 1));
    ({ windowRouters: visibleRouters, windowUsedLines } = buildWindow(startIndex));
  }

  const shouldShowFooter = filteredRouters.length > visibleRouters.length;
  const spacerHeight = Math.max(
    0,
    availableHeight - (shouldShowFooter ? footerHeight : 0) - windowUsedLines,
  );

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
        const absoluteIndex = startIndex + index;
        const isLast = index === visibleRouters.length - 1;
        return (
          <RouterItem
            key={router.name}
            router={router}
            services={allServices}
            isSelected={absoluteIndex === state.selectedRouter}
            terminalWidth={terminalWidth}
            isLast={isLast}
          />
        );
      })}

      {/* Spacer to push footer to bottom */}
      {spacerHeight > 0 && <Box height={spacerHeight} />}

      {/* Footer with navigation info */}
      {shouldShowFooter && (
        <Box justifyContent="center" backgroundColor="gray">
          <Text>
            {startIndex > 0 && "▲"} {startIndex + 1}-
            {startIndex + visibleRouters.length} of {filteredRouters.length}{" "}
            {startIndex + visibleRouters.length < filteredRouters.length &&
              "▼"}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default RoutersList;
