import { Box, Text } from "ink";
import React from "react";
import { getFailoverServices } from "../logic/failover";
import { getServiceStatus, type ServiceStatus } from "../logic/status";
import type { Router, Service } from "../types/traefik";
import { getRouterItemHeight, getServiceItemHeight } from "../utils/layout";
import ServiceItem from "./ServiceItem";

interface RouterItemProps {
  router: Router;
  services: Service[];
  isSelected: boolean;
  terminalWidth: number;
  isLast?: boolean; // NEW
  maxLines?: number;
  cutFrom?: "top" | "bottom";
}

const RouterItem: React.FC<RouterItemProps> = React.memo(
  ({
    router,
    services,
    isSelected,
    terminalWidth,
    isLast,
    maxLines,
    cutFrom = "bottom",
  }) => {
    const routerServices = services.filter((s) => {
      const escapedService = router.service.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const servicePattern = new RegExp(`^${escapedService}(@\\w+)?$`);
      return servicePattern.test(s.name);
    });

    // Derive router-level health and active service
    let aliveCount = 0;
    let activeServiceName: string | undefined;
    let routerStatus: ServiceStatus = "UNKNOWN";

    // Determine alive services and which one is effectively active
    for (const svc of routerServices) {
      if (svc.type === "failover" && svc.failover) {
        const { primary, fallback } = getFailoverServices(svc.name, services);
        const primaryStatus = primary
          ? getServiceStatus(primary, services, new Set())
          : "UNKNOWN";
        const fallbackStatus = fallback
          ? getServiceStatus(fallback, services, new Set())
          : "UNKNOWN";
        if (primaryStatus === "UP") {
          aliveCount += 1;
          if (!activeServiceName) activeServiceName = primary?.name;
        } else if (fallbackStatus === "UP") {
          aliveCount += 1;
          if (!activeServiceName) activeServiceName = fallback?.name;
        }
      } else {
        const st = getServiceStatus(svc, services, new Set());
        if (st === "UP") {
          aliveCount += 1;
          if (!activeServiceName) activeServiceName = svc.name;
        }
      }
    }
    routerStatus =
      aliveCount > 0 ? "UP" : routerServices.length === 0 ? "UNKNOWN" : "DOWN";
    const isDown = routerStatus === "DOWN";
    const selectedBg = isSelected
      ? isDown
        ? "redBright"
        : "blueBright"
      : undefined;
    const nameColor = isSelected ? "white" : isDown ? "red" : "white";
    const iconColor = isSelected ? "white" : isDown ? undefined : "cyan";

    // If no partial rendering requested, render full item as before
    if (maxLines === undefined) {
      return (
        <Box
          flexDirection="column"
          width={terminalWidth}
          marginBottom={isLast ? 0 : 1}
        >
          <Box width={terminalWidth} backgroundColor={selectedBg}>
            <Text wrap="truncate-end">
              <Text color={iconColor}>{isDown ? "💀" : "⬢ "}</Text>
              <Text color={nameColor} bold>
                {router.name.trim()}
              </Text>
            </Text>
          </Box>

          <Text color="gray" wrap="truncate-end">
            {"  "}
            <Text color="yellow">→</Text> {router.rule.trim()}
          </Text>

          {routerServices.map((service, index) => (
            <ServiceItem
              key={service.name}
              service={service}
              services={services}
              terminalWidth={terminalWidth}
              isLast={index === routerServices.length - 1}
              isActiveForRouter={
                service.type !== "failover" &&
                activeServiceName === service.name
              }
            />
          ))}
        </Box>
      );
    }

    // Partial rendering path
    let remaining = Math.max(0, maxLines);

    // Helper to decide whether to render or skip based on top slicing
    const renderTop = cutFrom === "top";

    // For top slicing, we need to skip the first (total - maxLines) lines
    let skip = 0;
    if (renderTop) {
      skip = Math.max(0, getRouterItemHeight(router, services) - remaining);
    }

    const lines: React.ReactNode[] = [];

    const pushLine = (node: React.ReactNode) => {
      if (skip > 0) {
        skip -= 1;
      } else if (remaining > 0) {
        lines.push(node);
        remaining -= 1;
      }
    };

    // Header line
    pushLine(
      <Box
        width={terminalWidth}
        backgroundColor={selectedBg}
        key="router-header"
      >
        <Text wrap="truncate-end">
          <Text color={iconColor}>{isDown ? "💀" : "⬢ "}</Text>
          <Text color={nameColor} bold>
            {router.name.trim()}
          </Text>
        </Text>
      </Box>,
    );

    // Rule line
    pushLine(
      <Text color="gray" wrap="truncate-end" key="router-rule">
        {"  "}
        <Text color="yellow">→</Text> {router.rule.trim()}
      </Text>,
    );

    // Services lines
    if (remaining > 0 || skip > 0) {
      for (
        let i = 0;
        i < routerServices.length && (remaining > 0 || skip > 0);
        i++
      ) {
        const service = routerServices[i];
        const isServiceLast = i === routerServices.length - 1;
        const svcHeight = getServiceItemHeight(service, services);

        if (skip >= svcHeight) {
          skip -= svcHeight;
          continue;
        }

        // Calculate how many lines we can render for this service
        const svcAvailable = renderTop ? svcHeight - skip : remaining;
        const svcMaxLines = Math.min(
          renderTop ? svcAvailable : remaining,
          svcHeight,
        );
        const svcCutFrom = renderTop && skip > 0 ? "top" : "bottom";

        lines.push(
          <ServiceItem
            key={service.name}
            service={service}
            services={services}
            terminalWidth={terminalWidth}
            isLast={isServiceLast}
            maxLines={svcMaxLines}
            cutFrom={svcCutFrom as any}
            isActiveForRouter={
              service.type !== "failover" && activeServiceName === service.name
            }
          />,
        );

        if (renderTop) {
          // In top-cut mode, we consumed (svcHeight - remaining after slicing) from skip + remaining
          const consumed = svcMaxLines;
          // After rendering, reset skip because we handled slicing within this item
          skip = 0;
          remaining -= consumed;
        } else {
          remaining -= svcMaxLines;
        }
      }
    }

    return (
      <Box
        flexDirection="column"
        width={terminalWidth}
        marginBottom={isLast ? 0 : 1}
      >
        {lines}
      </Box>
    );
  },
);

export default RouterItem;
