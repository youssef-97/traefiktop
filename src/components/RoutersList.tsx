import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import type React from "react";
import { useState } from "react";
import { useTraefikData } from "../hooks/useTraefikData";
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
  const [filter, setFilter] = useState("");
  const [selectedRouter, setSelectedRouter] = useState(0);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedRouter((prev) => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedRouter((prev) =>
        Math.min(filteredRouters.length - 1, prev + 1),
      );
    }
  });

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const filteredRouters = routers.filter((router) =>
    router.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Box flexDirection="column">
      <Box>
        <Text>Filter: </Text>
        <TextInput value={filter} onChange={setFilter} />
      </Box>
      {filteredRouters.map((router, index) => (
        <RouterItem
          key={router.name}
          router={router}
          services={services}
          isSelected={index === selectedRouter}
        />
      ))}
    </Box>
  );
};

export default RoutersList;
