import { join } from "path";
import { config } from "dotenv";
config({
  path: join(process.cwd(), ".env"),
});
import { CloudBuildClient } from "@google-cloud/cloudbuild";
import axios from "axios";

const client = new CloudBuildClient();

const cache = new Map<string, IOperation>();

interface IOperation {
  id: string;
  status:
    | "STATUS_UNKNOWN"
    | "PENDING"
    | "QUEUED"
    | "WORKING"
    | "SUCCESS"
    | "FAILURE"
    | "INTERNAL_ERROR"
    | "TIMEOUT"
    | "CANCELLED"
    | "EXPIRED"
    | any;
  startTime: string;
  finishTime: string;
  tags: string[];
}

(async () => {
  while (true) {
    console.log("Listening to CloudBuild events...");
    const [builds] = await client.listBuilds({
      projectId: process.env.GOOGLE_PROJECT_ID,
      filter: `create_time>="${new Date(
        new Date().getTime() - 1000 * 60 * 50
      ).toISOString()}"`,
      pageSize: 20,
    });

    builds.sort((a, b) => {
      return (
        // startTime asc
        parseInt(`${a.createTime?.seconds}`, 10) -
        parseInt(`${b.createTime?.seconds}`, 10)
        
      );
    });    

    for (const build of builds) {
      const status = build.status;
      const startTime = !build.startTime?.seconds
        ? undefined
        : new Date(
            parseInt(`${build.startTime.seconds}`, 10) * 1000
          ).toISOString();
      const finishTime = !build.finishTime?.seconds
        ? undefined
        : new Date(
            parseInt(`${build.finishTime.seconds}`, 10) * 1000
          ).toISOString();
      const tags = build.tags ?? [];

      const operation: IOperation = {
        id: build.id,
        status,
        startTime,
        finishTime,
        tags,
      };

      await provisionerCallback(operation, new Date().toISOString());
    }

    await new Promise((resolve) => setTimeout(resolve, 1000 * 5));
  }
})();

const provisionerCallback = async (
  operation: IOperation,
  publishTime: string
) => {
  try {
    if (cache.has(operation.id)) {
      const cachedOperation = cache.get(operation.id);
      if (cachedOperation?.status === operation.status) {
        return;
      }
    }

    cache.set(operation.id, operation);

    const body = {
      message: {
        publishTime,
        data: Buffer.from(JSON.stringify(operation)).toString("base64"),
      },
    };

    const response = await axios.post("/operations/cloudbuild/callback", body, {
      baseURL: process.env.PROVISIONER_URL,
    });
    console.log(
      "Callback sent to provisioner",
      operation.tags.find((tag) => tag.startsWith("operationId-")),
      operation.status,
      response.status,
      response.data
    );
  } catch (error) {
    console.error("Error while sending callback to provisioner", error);
  }
};
