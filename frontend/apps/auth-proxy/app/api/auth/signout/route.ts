import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  return NextResponse.redirect(
    process.env.NEXTAUTH_URL ?? '',
    {
      status: 302,
      headers: {
        "Set-Cookie": `token=rmvd; Path=/; Domain=${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}; Secure; SameSite=Lax; Expires=${new Date(Date.now() -1).toUTCString()}`,
        "Access-Control-Expose-Headers": "Set-Cookie",
      },
    }
  )
}