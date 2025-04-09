import { NextResponse } from "next/server";
import * as yup from "yup";
import { AxiosError, Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "..//types/grafana-api";
import grafanaApi from '../../lib/openapi/grafana-api.json';
import { randomBytes } from "crypto";
import curlirize from 'axios-curlirize';

const AddUserAccessSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  email: yup.string().required().email(),
  id: yup.string().required(),
  existingOrgId: yup.number().optional(),
});


export const userCreatedHandler = async (data: yup.InferType<typeof AddUserAccessSchema>) => {
  const { email, orgName, ...params } = AddUserAccessSchema.validateSync(data);
  let { existingOrgId } = params;

  // 3. Check if user exists, create one if not
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

  if (!existingOrgId) {
    try {
      existingOrgId = await client
        .getOrgByName({ org_name: orgName })
        .then((res) => res.data.id);
      console.log('org', orgName, 'already exists with id', existingOrgId);
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        existingOrgId = await client
          .createOrg(null, {
            name: orgName,
          })
          .then((res) => res.data.orgId)
          .catch((error) => {
            console.error("failed to create org", (error as any)?.response?.data ?? error);
            return undefined;
          });
        console.log('created org', orgName, 'with id', existingOrgId);
      }
    }
  }

  if (!existingOrgId) {
    console.error("Failed to create org");
    return NextResponse.json({}, { status: 500 });
  }

  let existingUserId = null;
  try {
    existingUserId = await client
      .getUserByLoginOrEmail({ loginOrEmail: email })
      .then((res) => res.data.id);
    console.log('user', email, 'already exists with id', existingUserId);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) {
      existingUserId = await client
        .adminCreateUser(null, {
          name: email,
          email: email,
          login: email,
          orgId: existingOrgId,
          password: randomBytes(32).toString("hex"),
        })
        .then((res) => res.data.id)
        .catch((error) => {
          console.error("failed to create user", (error as any)?.response?.data ?? error);
          return undefined;
        });
      console.log('created user', email, 'with id', existingUserId);
    } else {
      console.error("failed to get user", (error as any)?.response?.data ?? error);
    }
  }

  if (!existingUserId) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  // 4. Add user to organization
  try {
    await client.addOrgUser(
      { org_id: existingOrgId },
      { loginOrEmail: email, role: "Viewer" }
    );
    console.log('added user', email, 'to org', orgName);
  } catch (error) {
    console.error("failed to add user to org", (error as any)?.response?.data ?? error);
    return NextResponse.json(
      { error: "Failed to add user to organization" },
      { status: 500 }
    );
  }

  return NextResponse.json({}, { status: 200 });
};