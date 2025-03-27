import { NextResponse } from "next/server";
import * as yup from "yup";
import { Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../types/grafana-api";
import { readFile } from "node:fs/promises";

const DeleteGrafanaOrgSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
});

export const subscriptionDeletedHandler = async (data: yup.InferType<typeof DeleteGrafanaOrgSchema>) => {
  const { orgName } = DeleteGrafanaOrgSchema.validateSync(data);

  // 3. Delete grafana organization
  let client: Client;
  try {
    const api = new OpenAPIClientAxios({
      definition: JSON.parse(
        await readFile("./lib/openapi/grafana-api.json", "utf-8")
      ) as unknown as Document,
      axiosConfigDefaults: {
        baseURL: process.env.GRAFANA_URL,
        auth: {
          username: process.env.GRAFANA_SA_USERNAME ?? "",
          password: process.env.GRAFANA_SA_PASSWORD ?? "",
        },
      },
    });
    client = await api.init<Client>();
  } catch (error) {
    console.error("failed to initialize client", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }

  let orgId = null;
  try {
    const existingOrg = await client.getOrgByName({ org_name: orgName });
    if (!existingOrg.data.id) {
      return NextResponse.json({}, { status: 200 });
    }
    orgId = existingOrg.data.id;
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 200 });
  }

  try {
    await client.deleteOrgByID({ org_id: orgId });
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
};
