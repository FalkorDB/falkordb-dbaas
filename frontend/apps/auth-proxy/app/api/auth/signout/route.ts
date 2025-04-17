import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  return NextResponse.redirect(
    process.env.NEXTAUTH_URL + "/signin",
    {
      status: 302,
      headers: {
        "Set-Cookie": `token=; Path=/; Max-Age=0`,
        "Access-Control-Expose-Headers": "Set-Cookie",
      },
    }
  )
}