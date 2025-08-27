import { Box, Text } from "ink";
import type React from "react";
import type { Router, Service } from "../types/traefik";
import ServiceItem from "./ServiceItem";

interface RouterItemProps {
  router: Router;
  services: Service[];
  isSelected: boolean;
}

const RouterItem: React.FC<RouterItemProps> = ({
  router,
  services,
  isSelected,
}) => {
  const routerServices = services.filter((s) => s.usedBy.includes(router.name));

  return (
    <Box flexDirection="column">
      <Text backgroundColor={isSelected ? "blue" : undefined}>
        <Text color="green">🟢</Text> {router.name} ({router.rule})
      </Text>
      {routerServices.map((service) => (
        <ServiceItem key={service.name} service={service} services={services} />
      ))}
    </Box>
  );
};

export default RouterItem;
