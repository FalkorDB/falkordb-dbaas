import { RouteHandlerMethod } from "fastify";
import { ExportRDBRequestBody } from "../../../schemas/export-rdb";


export const exportRDBHandler: RouteHandlerMethod<undefined, undefined, undefined, {
  Body: ExportRDBRequestBody,
}> = async (request, reply) => {
  const {
    instanceId,
    username,
    password
  } = request.body;

  // Here you would implement the logic to export the RDB file
  // For example, you might call a service that handles the export process
  // and then return the result.

  reply.send({
    message: "Exporting RDB file...",
  });
}