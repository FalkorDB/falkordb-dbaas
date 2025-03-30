import { NextResponse } from "next/server";
import * as yup from "yup";
import { AxiosError } from "axios";
import { readFile } from "node:fs/promises";
import { Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../types/grafana-api";
import axios from "axios";

const CreateGrafanaFolderSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  folderName: yup.string().required().min(3).max(256),
});

export const instanceCreatedHandler = async (data: yup.InferType<typeof CreateGrafanaFolderSchema>) => {
  const { orgName, folderName } = CreateGrafanaFolderSchema.validateSync(data);

  // 3. Create grafana folder
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
    (v: { name: string }) => v.name === "namespace"
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