import { Box, Text } from "ink";
import React from "react";
import { getFailoverServices } from "../logic/failover";
import { getServiceStatus } from "../logic/status";
import type { Service } from "../types/traefik";

interface ServiceItemProps {
  service: Service;
  services: Service[];
  terminalWidth: number;
  isLast?: boolean;
}

const ServiceItem: React.FC<ServiceItemProps> = React.memo(
  ({ service, services, terminalWidth, isLast = false }) => {
    const status = getServiceStatus(service, services, new Set());
    const connector = isLast ? "└──" : "├──";

    // Helper function to get status indicator
    const getStatusIndicator = (serviceStatus: string) => {
      switch (serviceStatus) {
        case "UP":
          return <Text color="green">●</Text>;
        case "DOWN":
          return <Text color="red">●</Text>;
        default:
          return <Text color="gray">●</Text>;
      }
    };

    if (service.type === "failover") {
      const { primary, fallback } = getFailoverServices(service.name, services);
      const primaryStatus = primary
        ? getServiceStatus(primary, services, new Set())
        : "UNKNOWN";
      const fallbackStatus = fallback
        ? getServiceStatus(fallback, services, new Set())
        : "UNKNOWN";

      // Determine which service is currently active (primary if UP, otherwise fallback)
      const isUsingPrimary = primaryStatus === "UP";

      return (
        <Box flexDirection="column" width={terminalWidth}>
          <Text wrap="truncate-end">
            {"  "}
            {connector}{" "}
            <Text color="blue" bold>
              {service.name}
            </Text>{" "}
            <Text color="gray">(failover)</Text>
          </Text>
          {primary && (
            <Text wrap="truncate-end">
              {"  "}
              {"  "}├──{" "}
              <Text
                color={isUsingPrimary ? "green" : "gray"}
                bold={isUsingPrimary}
              >
                {isUsingPrimary ? "P " : ""}
                {primary.name.trim()}
              </Text>{" "}
              {getStatusIndicator(primaryStatus)}
              {isUsingPrimary && <Text color="green"> ← ACTIVE</Text>}
            </Text>
          )}
          {fallback && (
            <Text wrap="truncate-end">
              {"  "}
              {"  "}└──{" "}
              <Text
                color={!isUsingPrimary ? "yellow" : "gray"}
                bold={!isUsingPrimary}
              >
                {!isUsingPrimary ? "P " : ""}
                {fallback.name.trim()}
              </Text>{" "}
              {getStatusIndicator(fallbackStatus)}
              {!isUsingPrimary && (
                <Text color="yellow"> ← FALLBACK ACTIVE</Text>
              )}
            </Text>
          )}
        </Box>
      );
    }

    // Regular service
    const serverUrls =
      service.loadBalancer?.servers.map((s) => s.url.trim()).join(", ") ||
      "No servers";

    return (
      <Text wrap="truncate-end">
        {"  "}
        {connector}{" "}
        <Text color="white" bold>
          {service.name.trim()}
        </Text>{" "}
        {getStatusIndicator(status)} <Text color="gray">{serverUrls}</Text>
      </Text>
    );
  },
);

export default ServiceItem;
