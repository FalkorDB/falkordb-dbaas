import { NextResponse } from "next/server";
import * as yup from "yup";
import { AxiosError, Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../types/grafana-api";
import grafanaApi from '../../lib/openapi/grafana-api.json';
import curlirize from 'axios-curlirize';

const DeleteGrafanaOrgSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
});

export const subscriptionDeletedHandler = async (data: yup.InferType<typeof DeleteGrafanaOrgSchema>) => {
  const { orgName } = DeleteGrafanaOrgSchema.validateSync(data);

  // 3. Delete grafana organization
  let client: Client;
  try {
    const api = new OpenAPIClientAxios({
      definition: grafanaApi as unknown as Document,
      axiosConfigDefaults: {
        baseURL: process.env.INTERNAL_GRAFANA_URL,
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
      { status: 200 }
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

    if ((error as AxiosError).response?.status === 404) {
      return NextResponse.json({}, { status: 200 });
    }

    console.error('error getting org by name', (error as any)?.response?.data ?? error);
    return NextResponse.json({}, { status: 200 });
  }

  try {
    // remove users from org
    const users = await client.getOrgUsers({ org_id: orgId });
    for (const user of users.data) {
      if (user.name === process.env.GRAFANA_SA_USERNAME) {
        continue;
      }
      await client.removeOrgUser({ org_id: orgId, user_id: user.userId as number });
    }
  } catch (error) {
    console.error('error removing users from org', (error as any)?.response?.data ?? error);
    return NextResponse.json({}, { status: 200 });
  }

  try {
    await client.deleteOrgByID({ org_id: orgId });
    return NextResponse.json({}, { status: 200 });
  } catch (error) {

    if ((error as AxiosError).response?.status === 404) {
      return NextResponse.json({}, { status: 200 });
    }

    console.error('error deleting org', (error as any)?.response?.data ?? error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 200 }
    );
  }
};
