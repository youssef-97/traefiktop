import { useEffect, useState } from "react";
import type { Router, Service } from "../types/traefik";

const mockRouters: Router[] = [
  {
    entryPoints: ["dev"],
    middlewares: ["default-security-headers@file"],
    service: "api-auth",
    rule: "Host(`dev.penneo.com`) && PathPrefix(`/auth/api`)",
    priority: 49,
    tls: { options: "default" },
    status: "enabled",
    using: ["dev"],
    name: "api-auth-api-router@file",
    provider: "file",
  },
  {
    entryPoints: ["dev"],
    middlewares: [],
    service: "api-docs",
    rule: "Host(`api-docs.penneo.devel`)",
    priority: 2,
    status: "enabled",
    using: ["dev"],
    name: "api-docs-router@file",
    provider: "file",
  },
  {
    entryPoints: ["dev"],
    middlewares: [],
    service: "failover-service@file",
    rule: "Host(`failover.penneo.devel`)",
    priority: 1,
    status: "enabled",
    using: ["dev"],
    name: "failover-router@file",
    provider: "file",
  },
];

const mockServices: Service[] = [
  {
    loadBalancer: {
      servers: [{ url: "http://nginx-auth" }],
      healthCheck: {
        mode: "http",
        path: "/api/v1/status",
        interval: "5s",
        timeout: "2s",
      },
    },
    status: "enabled",
    serverStatus: { "http://nginx-auth": "UP" },
    usedBy: ["api-auth-api-router@file", "api-auth@file"],
    name: "api-auth-local@file",
    provider: "file",
    type: "loadbalancer",
  },
  {
    loadBalancer: {
      servers: [{ url: "http://docs-server:3000" }],
    },
    status: "enabled",
    serverStatus: { "http://docs-server:3000": "UP" },
    usedBy: ["api-docs-router@file"],
    name: "api-docs-service",
    provider: "file",
    type: "loadbalancer",
  },
  {
    status: "enabled",
    usedBy: ["failover-router@file"],
    name: "failover-service@file",
    provider: "file",
    type: "failover",
  },
  {
    loadBalancer: {
      servers: [{ url: "http://primary-service" }],
    },
    status: "enabled",
    serverStatus: { "http://primary-service": "UP" },
    usedBy: ["failover-service@file"],
    name: "primary-service@file",
    provider: "file",
    type: "loadbalancer",
  },
  {
    loadBalancer: {
      servers: [{ url: "http://fallback-service" }],
    },
    status: "enabled",
    serverStatus: { "http://fallback-service": "DOWN" },
    usedBy: ["failover-service@file"],
    name: "fallback-service@file",
    provider: "file",
    type: "loadbalancer",
  },
];

export const useTraefikData = (_apiUrl: string) => {
  const [routers, setRouters] = useState<Router[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setRouters(mockRouters);
      setServices(mockServices);
      setLoading(false);
    };

    fetchData();
  }, []);

  return { routers, services, loading, error };
};
