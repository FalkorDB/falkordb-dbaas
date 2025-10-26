import { NextRequest, NextResponse } from "next/server";
import { decode, verify } from "jsonwebtoken";
import { AxiosError } from "axios";
import Cache from 'memory-cache';
import { axiosClient as axios } from '../../../axios';
import { changeUserCurrentOrg } from "../../../lib/utils/changeGrafanaUserOrg";

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

  const queryParams = new URL(req.url).searchParams;
  const orgID = queryParams.get("orgID");
  const cachedUserEmail = Cache.get(userID);
  if (cachedUserEmail) {
    if (orgID) await changeUserCurrentOrg(cachedUserEmail, orgID);
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

    if (orgID) await changeUserCurrentOrg(response.data.email, orgID);
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
