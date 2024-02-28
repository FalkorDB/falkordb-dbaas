import { RouteHandlerMethod } from "fastify";

export const tenantGroupProvisionHandler: RouteHandlerMethod = async (request, reply) => {
  return { hello: "world" };
};
