import type { Router, Service } from "@src/types/traefik";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

const RouterSchema = z.object({
  entryPoints: z.array(z.string()),
  middlewares: z.array(z.string()).optional(),
  service: z.string(),
  rule: z.string(),
  priority: z.number(),
  tls: z.object({ options: z.string() }).optional(),
  status: z.string(),
  using: z.array(z.string()),
  name: z.string(),
  provider: z.string(),
});

const ServiceSchema = z.object({
  loadBalancer: z
    .object({
      servers: z.array(z.object({ url: z.string() })),
      healthCheck: z
        .object({
          mode: z.string(),
          path: z.string(),
          interval: z.string(),
          timeout: z.string(),
        })
        .optional(),
    })
    .optional(),
  status: z.string(),
  serverStatus: z.record(z.string()).optional(),
  usedBy: z.array(z.string()),
  name: z.string(),
  provider: z.string(),
  type: z.string(),
});

const fetchTraefikData = <T>(
  url: string,
  schema: z.ZodSchema<T>,
): ResultAsync<T, Error> => {
  return ResultAsync.fromPromise(
    fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch from ${url}: ${res.statusText}`);
      }
      return res.json();
    }),
    (e) => new Error(`Failed to fetch data: ${(e as Error).message}`),
  ).andThen((data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      return err(new Error(`Failed to parse data: ${result.error.message}`));
    }
    return ok(result.data);
  });
};

export const getRouters = (apiUrl: string): ResultAsync<Router[], Error> =>
  fetchTraefikData(`${apiUrl}/api/http/routers`, z.array(RouterSchema));

export const getServices = (apiUrl: string): ResultAsync<Service[], Error> =>
  fetchTraefikData(`${apiUrl}/api/http/services`, z.array(ServiceSchema));
