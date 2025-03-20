import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import { Axios, AxiosError, OpenAPIClientAxios } from "openapi-client-axios";
import { Client } from "../../../../lib/types/grafana-api";
import { readFile } from "node:fs/promises";
import { randomBytes } from "crypto";

const AddUserAccessSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  email: yup.string().required().email(),
});

const RemoveUserAccessSchema = yup.object({
  orgName: yup.string().required().min(3).max(256),
  email: yup.string().required().email(),
});

export const POST = async (req: NextRequest) => {
  // 1. Check request authentication (static token)
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const { email, orgName } = await AddUserAccessSchema.validate(
    await req.json()
  );

  // 3. Check if user exists, create one if not
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

  let existingUserId = null;
  try {
    existingUserId = await client
      .getUserByLoginOrEmail({ loginOrEmail: email })
      .then((res) => res.data.id);
  } catch (error) {
    if ((error as AxiosError).response?.status === 404) {
      existingUserId = await client
        .adminCreateUser(null, {
          name: email,
          email: email,
          password: randomBytes(32).toString("hex"),
        })
        .then((res) => res.data.id);
    } else {
      console.error("failed to get user", error);
    }
  }

  if (!existingUserId) {
    return NextResponse.json(
      { error: "Failed to create user" },
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
    console.error("Failed to create org");
    return NextResponse.json({}, { status: 500 });
  }

  // 4. Add user to organization
  try {
    await client.addOrgUser(
      { org_id: existingOrgId },
      { loginOrEmail: email, role: "Viewer" }
    );
  } catch (error) {
    console.error("failed to add user to org", error);
    return NextResponse.json(
      { error: "Failed to add user to organization" },
      { status: 500 }
    );
  }

  return NextResponse.json({}, { status: 200 });
};

export const DELETE = async (req: NextRequest) => {
  // 1. Check request authentication (static token)
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.GRAFANA_WEBHOOK_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate body
  const { email, orgName } = await RemoveUserAccessSchema.validate(
    await req.json()
  );

  // 3. Check if user exists, create one if not
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

  let existingUserId: number | null = null;
  try {
    existingUserId = await client
      .getUserByLoginOrEmail({ loginOrEmail: email })
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
