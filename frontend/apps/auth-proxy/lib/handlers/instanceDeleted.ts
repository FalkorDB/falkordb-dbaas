import { NextResponse } from "next/server";
import * as yup from "yup";
import { Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../types/grafana-api";
import grafanaApi from '../../lib/openapi/grafana-api.json';
import curlirize from 'axios-curlirize';

const DeleteGrafanaFolderSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  folderName: yup.string().required().min(3).max(256),
});


export const instanceDeletedHandler = async (data: yup.InferType<typeof DeleteGrafanaFolderSchema>) => {

  const { orgName, folderName } = DeleteGrafanaFolderSchema.validateSync(data);

  // 3. Delete grafana folder
  let client: Client;
  try {
    const api = new OpenAPIClientAxios({
      definition: grafanaApi as unknown as Document,
      axiosConfigDefaults: {
        baseURL: process.env.GRAFANA_URL,
        auth: {
          username: process.env.GRAFANA_SA_USERNAME ?? "",
          password: process.env.GRAFANA_SA_PASSWORD ?? "",
        },
      },
    });
    client = await api.init<Client>();
    curlirize(client)
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
    console.error("failed to get org", (error as any)?.response?.data ?? error);
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
    console.error("failed to get folders", (error as any)?.response?.data ?? error);
    return NextResponse.json(
      { error: "Failed to get folders" },
      { status: 200 }
    );
  }

  if (!folderUid) {
    return NextResponse.json({}, { status: 200 });
  }

  try {
    await client.deleteFolder({ folder_uid: folderUid }, null, { params: { orgId } });
  } catch (error) {
    console.error("failed to delete folder", (error as any)?.response?.data ?? error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }

  return NextResponse.json({}, { status: 200 });
};
