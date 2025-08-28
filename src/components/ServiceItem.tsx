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
  maxLines?: number;
  cutFrom?: "top" | "bottom";
  isActiveForRouter?: boolean;
}

const ServiceItem: React.FC<ServiceItemProps> = React.memo(
  ({
    service,
    services,
    terminalWidth,
    isLast = false,
    maxLines,
    cutFrom = "bottom",
    isActiveForRouter = false,
  }) => {
    const status = getServiceStatus(service, services, new Set());
    const connector = isLast ? "└──" : "├──";

    // Helper: emoji status indicator
    const statusEmoji = (serviceStatus: string) => {
      switch (serviceStatus) {
        case "UP":
          return <Text>✅</Text>;
        case "DOWN":
          return <Text>❌</Text>;
        default:
          return <Text>❓</Text>;
      }
    };

    // Minimal presentation; no per-service counts here to reduce noise

    if (service.type === "failover") {
      // Build lines for a failover service
      const { primary, fallback } = getFailoverServices(service.name, services);
      const primaryStatus = primary
        ? getServiceStatus(primary, services, new Set())
        : "UNKNOWN";
      const fallbackStatus = fallback
        ? getServiceStatus(fallback, services, new Set())
        : "UNKNOWN";

      const isUsingPrimary = primaryStatus === "UP";

      const lines: React.ReactNode[] = [];
      // Header line
      lines.push(
        <Text wrap="truncate-end" key="fo-header">
          {"  "}
          {connector}{" "}
          <Text color="magenta" dimColor>
            {service.name}
          </Text>{" "}
          <Text color="magenta" dimColor>
            (failover)
          </Text>
        </Text>,
      );
      if (primary) {
        lines.push(
          <Text
            wrap="truncate-end"
            key="fo-primary"
            color={isUsingPrimary ? undefined : "gray"}
          >
            {"  "}
            {"  "}├── {statusEmoji(primaryStatus)} {primary.name.trim()}
          </Text>,
        );
      }
      if (fallback) {
        lines.push(
          <Text
            wrap="truncate-end"
            key="fo-fallback"
            color={!isUsingPrimary ? undefined : "gray"}
          >
            {"  "}
            {"  "}└── {statusEmoji(fallbackStatus)} {fallback.name.trim()}
          </Text>,
        );
      }

      // Apply partial slicing if requested
      const renderLines =
        maxLines && maxLines >= 0
          ? (() => {
              if (maxLines === undefined) return lines;
              if (maxLines === 0) return [] as React.ReactNode[];
              if (cutFrom === "top")
                return lines.slice(Math.max(0, lines.length - maxLines));
              return lines.slice(0, Math.min(lines.length, maxLines));
            })()
          : lines;

      return (
        <Box flexDirection="column" width={terminalWidth}>
          {renderLines}
        </Box>
      );
    }

    // Regular service
    // Simplify: omit URLs to reduce visual noise

    if (maxLines !== undefined && maxLines <= 0) {
      return null;
    }
    return (
      <Text
        wrap="truncate-end"
        color={isActiveForRouter && status !== "DOWN" ? undefined : "gray"}
      >
        {"  "}
        {connector} {statusEmoji(status)}
        {service.name.trim()}
      </Text>
    );
  },
);

export default ServiceItem;
