import { NextRequest, NextResponse } from "next/server";
import { decode, verify } from "jsonwebtoken";
import { AxiosError } from "axios";
import Cache from 'memory-cache';
import { axiosClient as axios } from '../../../axios';
import { changeUserCurrentOrg } from "../../../lib/utils/changeGrafanaUserOrg";
import OpenAPIClientAxios, { Document } from "openapi-client-axios";
import { Client } from "../../../lib/types/grafana-api";
import grafanaApi from '../../../lib/openapi/grafana-api.json';

export const GET = async (req: NextRequest) => {
  // get basic auth
  const basicAuth = req.headers.get("Authorization");
  if (basicAuth) {
    const [username, password] = Buffer.from(basicAuth.split(" ")[1] ?? "", "base64")
      .toString()
      .split(":");
    if (username !== process.env.GRAFANA_SA_USERNAME || password !== process.env.GRAFANA_SA_PASSWORD) {
      console.log("Invalid authentication credentials");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      console.log("Valid authentication credentials");
      return NextResponse.json(
        {},
        {
          status: 200,
          headers: {
            "x-webauth-user": username || "sa",
          },
        }
      );
    }
  }

  const token = req.cookies.get("token");

  // check if token is set
  if (!token) {

    const grafana_session = req.cookies.get("grafana_session");
    if (grafana_session) {
      const response = await axios.get(process.env.INTERNAL_GRAFANA_URL + '/user', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': `grafana_session=${grafana_session.value}`,
        },
      });
      if (response.status === 200) {
        const email = response.data.email;
        if (email === process.env.GRAFANA_SA_USERNAME) {
          return NextResponse.json(
            {},
            {
              status: 200,
              headers: {
                "x-webauth-user": email,
              },
            }
          );
        }
      }

    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userID } = decode(token.value) as any;

  if (!userID) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = req.headers.get('X-Org-ID') || new URL(process.env.INTERNAL_GRAFANA_URL + (req.headers.get('X-Original-URI') || '')).searchParams.get('orgId');
  console.log("Verifying userID: %s for orgId: %s - full uri: %s", userID, orgId, req.headers.get('X-Original-URI'));

  let client: Client | undefined = undefined;
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
  } catch (error) {
    console.error("failed to initialize client", error);
  }


  let grafanaOrgId: number | undefined = undefined;
  if (client && orgId) {
    grafanaOrgId = await client.getOrgByName({
      org_name: orgId,
    }).then(res => res.data.id).catch(err => {
      console.error("failed to get org by name", err);
      return undefined;
    });
  }

  const cachedUserEmail = Cache.get(userID);
  if (cachedUserEmail) {
    if (client && grafanaOrgId) await changeUserCurrentOrg(client, cachedUserEmail, grafanaOrgId);
    return NextResponse.json(
      {},
      {
        status: 200,
        headers: {
          "x-webauth-user": cachedUserEmail,
        },
      }
    );
  }

  try {

    const response = await axios.get(
      `https://api.omnistrate.cloud/2022-09-01-00/fleet/user/${userID}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'Authorization': `Bearer ${token.value}`,
        },
      }
    )

    if (response.status !== 200) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    Cache.put(userID, response.data.email, 1000 * 60 * 60); // cache for 1 hour

    if (client && grafanaOrgId) await changeUserCurrentOrg(client, response.data.email, grafanaOrgId);
    return NextResponse.json(
      {},
      {
        status: 200,
        headers: {
          "x-webauth-user": response.data.email,
        },
      }
    );
  } catch (error) {
    console.error("Error verifying token", (error as AxiosError)?.response ?? error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
};
