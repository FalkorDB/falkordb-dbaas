import { NextResponse } from "next/server";
import * as yup from "yup";
import { AxiosError, Document, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "..//types/grafana-api";
import { readFile } from "node:fs/promises";

const RemoveUserAccessSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  id: yup.string().required(),
});


export const userDeletedHandler = async (data: yup.InferType<typeof RemoveUserAccessSchema>) => {

  const { id, orgName } = RemoveUserAccessSchema.validateSync(data);

  // 3. Check if user exists, create one if not
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

  let existingUserId: number | null = null;
  try {
    existingUserId = await client
      .getUserByLoginOrEmail({ loginOrEmail: id })
      .then((res) => res.data.id ?? null);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) {
      return NextResponse.json({}, { status: 200 });
    }
  }

  let existingOrgId: number | null = null;
  try {
    existingOrgId = await client
      .getOrgByName({ org_name: orgName })
      .then((res) => res.data.id ?? null);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) {
      return NextResponse.json({}, { status: 200 });
    }
  }

  if (!existingOrgId || !existingUserId) {
    return NextResponse.json({}, { status: 200 });
  }

  // 4. Remove user from organization
  try {
    await client.removeOrgUser({
      org_id: existingOrgId,
      user_id: existingUserId,
    });
  } catch (error) {
    console.error("failed to remove user from org", error);
    return NextResponse.json(
      { error: "Failed to remove user from organization" },
      { status: 500 }
    );
  }

  return NextResponse.json({}, { status: 200 });
};
