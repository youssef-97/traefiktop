import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useTraefikData } from "../hooks/useTraefikData";
import { useTui } from "../tui/useTui";
import RouterItem from "./RouterItem";

interface RoutersListProps {
  apiUrl: string;
  useTraefikDataHook?: typeof useTraefikData;
}

const RoutersList: React.FC<RoutersListProps> = ({
  apiUrl,
  useTraefikDataHook = useTraefikData,
}) => {
  const { routers, services, loading, error } = useTraefikDataHook(apiUrl);
  const { state, dispatch, filteredRouters } = useTui(routers);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <Box flexDirection="column">
      {state.mode === "search" ? (
        <Box>
          <Text>Filter: </Text>
          <TextInput
            value={state.searchQuery}
            onChange={(query) =>
              dispatch({ type: "SET_SEARCH_QUERY", payload: query })
            }
          />
        </Box>
      ) : (
        <Box>
          <Text>Press / to search</Text>
        </Box>
      )}
      {filteredRouters.map((router, index) => (
        <RouterItem
          key={router.name}
          router={router}
          services={services}
          isSelected={index === state.selectedRouter}
        />
      ))}
    </Box>
  );
};

export default RoutersList;
