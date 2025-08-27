import type { Service } from "../types/traefik";

export type ServiceStatus = "UP" | "DOWN" | "UNKNOWN";

export const getServiceStatus = (service: Service): ServiceStatus => {
  if (service.serverStatus) {
    const statuses = Object.values(service.serverStatus);
    if (statuses.includes("UP")) {
      return "UP";
    }
    if (statuses.length > 0) {
      return "DOWN";
    }
  }
  return "UNKNOWN";
};
