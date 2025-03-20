import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { AxiosError } from "axios";
import { readFile } from "node:fs/promises";
import { OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../../../../lib/types/grafana-api";
import axios from "axios";

const CreateGrafanaFolderSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  folderName: yup.string().required().min(3).max(256),
});

const DeleteGrafanaFolderSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  folderName: yup.string().required().min(3).max(256),
});

export const POST = async (req: NextRequest) => {
  // 1. Check request authentication (static token)
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const { orgName, folderName } = await CreateGrafanaFolderSchema.validate(
    await req.json()
  );

  // 3. Create grafana folder
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

  let existingOrgId = null;
  try {
    existingOrgId = await client
      .getOrgByName({ org_name: orgName })
      .then((res) => res.data.id);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) {
      existingOrgId = await client
        .createOrg(null, {
          name: orgName,
        })
        .then((res) => res.data.orgId);
    }
  }

  if (!existingOrgId) {
    console.error("Failed to create folder");
    return NextResponse.json({}, { status: 500 });
  }

  let folderUid = null;
  try {
    const folders = await client.getFolders(null, null, {
      params: { orgId: existingOrgId },
    });
    const existingFolder = folders.data.find(
      (folder) => folder.title === folderName
    );
    folderUid = existingFolder?.uid;
  } catch (error) {
    console.error(error);
    return NextResponse.json({}, { status: 200 });
  }

  if (!folderUid) {
    try {
      const { data } = await client.createFolder(
        null,
        {
          title: folderName,
        },
        { params: { orgId: existingOrgId } }
      );
      folderUid = data.uid;
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to create folder" },
        { status: 500 }
      );
    }
  }

  try {
    await client.postDashboard(
      null,
      {
        folderUid,
        overwrite: false,
        message: "Initial dashboard",
        dashboard: await getDashboard(folderName),
      },
      {
        params: { orgId: existingOrgId },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create dashboard" },
      { status: 500 }
    );
  }

  return NextResponse.json({}, { status: 200 });
};

const getDashboard = async (uid: string) => {
  const dashboard = await axios
    .get(
      "https://raw.githubusercontent.com/FalkorDB/falkordb-dbaas/refs/heads/main/observability/grafana/dashboards/falkordb-cloud.json"
    )
    .then((res) => res.data);
  dashboard.uid = uid;
  dashboard.title = "FalkorDB dashboard for " + uid;

  const nsTemplatingIdx = dashboard.templating.list.findIndex(
    (v: any) => v.name === "namespace"
  );
  if (nsTemplatingIdx !== -1) {
    dashboard.templating.list[nsTemplatingIdx] = {
      current: {
        text: "instance-y",
        value: "instance-y",
      },
      hide: 2,
      name: "namespace",
      query: "instance-y",
      skipUrlSync: true,
      type: "constant",
    };
  }

  return dashboard;
};

export const DELETE = async (req: NextRequest) => {
  // 1. Check request authentication (static token)
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const { orgName, folderName } = await DeleteGrafanaFolderSchema.validate(
    await req.json()
  );

  // 3. Delete grafana folder
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
    console.error("failed to get org", error);
    return NextResponse.json(
      { error: "Failed to get organization" },
      { status: 500 }
    );
  }

  let folderUid = null;
  try {
    const folders = await client.getFolders(null, null, {
      params: { orgId },
    });
    const existingFolder = folders.data.filter(
      (folder) => folder.title === folderName
    )[0];
    folderUid = existingFolder?.uid;
  } catch (error) {
    console.error("failed to get folders", error);
    return NextResponse.json(
      { error: "Failed to get folders" },
      { status: 500 }
    );
  }

  if (!folderUid) {
    return NextResponse.json({}, { status: 200 });
  }

  try {
    await client.deleteFolder({ folder_uid: folderUid }, { params: { orgId } });
  } catch (error) {
    console.error("failed to delete folder", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }

  return NextResponse.json({}, { status: 200 });
};
