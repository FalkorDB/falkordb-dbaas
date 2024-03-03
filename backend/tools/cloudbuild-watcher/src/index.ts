import { config } from "dotenv";
config();
import { CloudBuildClient } from "@google-cloud/cloudbuild";
import axios from "axios";

const client = new CloudBuildClient();
const axiosClient = axios.create({
  url: process.env.PROVISIONER_URL,
});

interface IOperation {
  operationId: string;
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
  console.log("Starting listening to CloudBuild events...");

  for await (const build of client.listBuildsAsync({
    projectId: process.env.GOOGLE_PROJECT_ID,
    filter: `create_time>="${new Date(
      new Date().getTime() - 1000 * 60 * 60 * 24
    ).toISOString()}"`,
  })) {
    const operationId = build.id;
    const status = build.status;
    const startTime = !build.startTime?.seconds
      ? null
      : new Date(
          parseInt(`${build.startTime.seconds}`, 10) * 1000
        ).toLocaleString();
    const finishTime = !build.finishTime?.seconds
      ? null
      : new Date(
          parseInt(`${build.finishTime.seconds}`, 10) * 1000
        ).toLocaleString();
    const tags = build.tags ?? [];

    const operation: IOperation = {
      operationId,
      status,
      startTime,
      finishTime,
      tags,
    };

    provisionerCallback(operation);
  }
})();

const provisionerCallback = async (operation: IOperation) => {
  try {
    const response = await axiosClient.post("/operations/callback", operation);
    console.log("Callback sent to provisioner", response.status, response.data);
  } catch (error) {
    console.error("Error while sending callback to provisioner", error);
  }
};
