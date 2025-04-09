import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  // get basic auth
  const basicAuth = req.headers.get("Authorization");
  if (basicAuth) {
    const [username, password] = Buffer.from(basicAuth.split(" ")[1] ?? "", "base64")
      .toString()
      .split(":");
    if (username !== process.env.GRAFANA_SA_USERNAME || password !== process.env.GRAFANA_SA_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
