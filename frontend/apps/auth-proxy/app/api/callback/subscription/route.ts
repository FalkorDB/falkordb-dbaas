import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { Axios, AxiosError, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../../../../lib/types/grafana-api";
import { readFile } from "node:fs/promises";

const CreateGrafanaOrgSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
});

const DeleteGrafanaOrgSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
});

export const POST = async (req: NextRequest) => {
  // 1. Check request authentication (static token)
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const { orgName } = await CreateGrafanaOrgSchema.validate(await req.json());

  // 3. Create grafana organization
  let client: Client;
  try {
    const api = new OpenAPIClientAxios({
      definition: JSON.parse(
        await readFile("./lib/openapi/grafana-api.json", "utf-8")
      ) as any,
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

  const existingOrg = await client
    .getOrgByName({ org_name: orgName })
    .then((res) => res.data)
    .catch(() => {});
  if (existingOrg?.id) {
    return NextResponse.json({}, { status: 200 });
  }

  try {
    await client.createOrg(null, {
      name: orgName,
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("failed to create org", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  // 1. Check request authentication (static token)
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const { orgName } = await DeleteGrafanaOrgSchema.validate(await req.json());

  // 3. Delete grafana organization
  let client: Client;
  try {
    const api = new OpenAPIClientAxios({
      definition: JSON.parse(
        await readFile("./lib/openapi/grafana-api.json", "utf-8")
      ) as any,
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
