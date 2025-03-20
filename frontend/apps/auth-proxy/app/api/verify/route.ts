import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
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
        "x-webauth-user": session.user?.email,
      },
    }
  );
};
