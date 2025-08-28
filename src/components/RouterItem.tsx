import { Box, Text } from "ink";
import React from "react";
import type { Router, Service } from "../types/traefik";
import ServiceItem from "./ServiceItem";

interface RouterItemProps {
  router: Router;
  services: Service[];
  isSelected: boolean;
  terminalWidth: number;
  isLast?: boolean; // NEW
}

const RouterItem: React.FC<RouterItemProps> = React.memo(
  ({ router, services, isSelected, terminalWidth, isLast }) => {
    const routerServices = services.filter((s) => {
      const escapedService = router.service.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const servicePattern = new RegExp(`^${escapedService}(@\\w+)?$`);
      return servicePattern.test(s.name);
    });

    return (
      <Box
        flexDirection="column"
        width={terminalWidth}
        marginBottom={isLast ? 0 : 1} // no extra blank line at end
      >
        <Text
          backgroundColor={isSelected ? "blue" : undefined}
          wrap="truncate-end"
        >
          <Text color="cyan">⬢</Text>{" "}
          <Text color="white" bold>
            {router.name}
          </Text>
        </Text>

        <Text color="gray" wrap="truncate-end">
          {"  "}
          <Text color="yellow">→</Text> {router.rule.trim()}
        </Text>

        {routerServices.map((service, index) => {
          const isServiceLast = index === routerServices.length - 1;
          return (
            <ServiceItem
              key={service.name}
              service={service}
              services={services}
              terminalWidth={terminalWidth}
              isLast={isServiceLast}
            />
          );
        })}
      </Box>
    );
  },
);

export default RouterItem;
