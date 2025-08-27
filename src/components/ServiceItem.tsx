import { Box, Text } from "ink";
import type React from "react";
import { getFailoverServices } from "../logic/failover";
import { getServiceStatus } from "../logic/status";
import type { Service } from "../types/traefik";

interface ServiceItemProps {
  service: Service;
  services: Service[];
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, services }) => {
  if (service.type === "failover") {
    const { primary, fallback } = getFailoverServices(service.name, services);
    return (
      <Box flexDirection="column">
        <Text>
          {"  "}⚪ {service.name} (failover)
        </Text>
        {primary && <ServiceItem service={primary} services={services} />}
        {fallback && <ServiceItem service={fallback} services={services} />}
      </Box>
    );
  }

  const status = getServiceStatus(service);
  const color = status === "UP" ? "green" : "grey";
  const circle = status === "UP" ? "🟢" : "⚪";

  return (
    <Text>
      {"  "}
      <Text color={color}>{circle}</Text> {service.name} (
      {service.loadBalancer?.servers.map((s) => s.url).join(", ")}) [{status}]
    </Text>
  );
};

export default ServiceItem;
