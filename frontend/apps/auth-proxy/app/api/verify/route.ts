import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {

  // get basic auth
  const basicAuth = req.headers.get("Authorization");
  console.log('has authorization header', !!basicAuth);
  if (basicAuth) {
    console.log("Got authentication header");
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

  const session = await getServerSession(authOptions);
  if (!session || !(session.user?.email || (session.user as any)?.id || (session.user as any)?.name)) {
    // check if grafana_session cookie is set
    const grafanaSession = req.cookies.get("grafana_session");
    if (grafanaSession) {
      return NextResponse.json(
        {},
        {
          status: 200,
        }
      );
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "x-webauth-user": (session.user as any)?.email || (session.user as any)?.id || (session.user as any)?.name,
      },
    }
  );
};
