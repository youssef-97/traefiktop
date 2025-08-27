import type { Service } from "../types/traefik";

export interface FailoverServices {
  primary: Service | undefined;
  fallback: Service | undefined;
}

export const getFailoverServices = (
  serviceName: string,
  services: Service[],
): FailoverServices => {
  const failoverService = services.find(
    (service) => service.name === serviceName,
  );
  if (!failoverService || failoverService.type !== "failover") {
    return { primary: undefined, fallback: undefined };
  }

  const usedServices = services.filter((service) =>
    service.usedBy.includes(serviceName),
  );

  return {
    primary: usedServices[0],
    fallback: usedServices[1],
  };
};
