import { NextResponse } from "next/server";
import * as yup from "yup";
import { Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../types/grafana-api";
import grafanaApi from '../../lib/openapi/grafana-api.json';
import { userCreatedHandler } from "./userCreated";
import axios from "axios";

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

  let existingOrgId = await client
    .getOrgByName({ org_name: orgName })
    .then((res) => res.data.id)
    .catch(() => { return undefined });
  if (existingOrgId) {
    console.log('org', orgName, 'already exists with id', existingOrgId);
    return userCreatedHandler({ ...data, existingOrgId });
  }

  try {
    const response = await client.createOrg(null, {
      name: orgName,
    });
    existingOrgId = response.data.orgId;
    console.log('created org', orgName, 'with id', existingOrgId);
  } catch (error) {
    console.error("failed to create org", (error as any)?.response ?? error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_GRAFANA_URL}/grafana/api/datasources`,
      {
        "type": "prometheus",
        "access": "proxy",
        "isDefault": true,
        "jsonData": {
          "timeInterval": "5s",
          "tlsSkipVerify": "true",
        },
        "name": "VictoriaMetrics",
        "url": "http://vmsingle-vm-victoria-metrics-k8s-stack.observability.svc.cluster.local:8429"
      },
      {
        params: {
          orgId: existingOrgId,
        },
        auth: {
          username: process.env.GRAFANA_SA_USERNAME ?? "",
          password: process.env.GRAFANA_SA_PASSWORD ?? "",
        },
        beforeRedirect: (options) => {
          options.headers["Authorization"] = `Basic ${Buffer.from(
            `${process.env.GRAFANA_SA_USERNAME}:${process.env.GRAFANA_SA_PASSWORD}`
          ).toString("base64")}`;
        }
      }
    )
    console.log('created datasource for org', orgName, 'with id', existingOrgId);
  } catch (error) {
    console.error("failed to create datasource", (error as any)?.response ?? error);
    return NextResponse.json(
      { error: "Failed to create datasource" },
      { status: 200 }
    );
  }

  return userCreatedHandler({ ...data, existingOrgId })
};
