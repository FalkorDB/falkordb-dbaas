import express from "express";
import { createQueueDashExpressMiddleware } from "@queuedash/api";
import { getQueues, workerError } from "./workers/workers";
import logger from "./logger";

const app = express();

export const setupApp = () => {
  app.use(
    "/queuedash",
    createQueueDashExpressMiddleware({
      ctx: {
        queues: getQueues().map(q => ({
          displayName: q.name,
          queue: q,
          type: "bullmq",
        })),
      },
    })
  );

  app.use('/healthz', (req, res) => {
    if (workerError) {
      res.status(500).send({
        status: 'error',
      });
    } else {
      res.status(200).send({
        status: 'ok',
      });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info("Listening on port " + port);
    logger.debug("Visit http://localhost:3000/queuedash");
  });
}