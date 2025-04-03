import { NextResponse } from "next/server";
import * as yup from "yup";
import { Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../types/grafana-api";
import grafanaApi from '../../lib/openapi/grafana-api.json';
import { userCreatedHandler } from "./userCreated";

const CreateGrafanaOrgSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  id: yup.string().required(),
  email: yup.string().required().email(),
});

export const subscriptionCreatedHandler = async (data: yup.InferType<typeof CreateGrafanaOrgSchema>) => {

  const { orgName } = CreateGrafanaOrgSchema.validateSync(data);

  // 3. Create grafana organization
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
    .catch(() => { });
  if (existingOrg?.id) {
    return NextResponse.json({}, { status: 200 });
  }

  try {
    await client.createOrg(null, {
      name: orgName,
    });
  } catch (error) {
    if ((error as any)?.response) {
      console.error("failed to create org", (error as any).request);
    } else {
      console.error("failed to create org", error);
    }
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }

  return userCreatedHandler(data)
};
