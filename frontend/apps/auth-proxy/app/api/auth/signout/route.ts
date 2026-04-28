import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin;
  const response = NextResponse.redirect(origin, {
    status: 302,
  });

  const expires = new Date(Date.now() - 1).toUTCString();

  response.headers.append(
    "Set-Cookie",
    `token=rmvd; Path=/; Domain=${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}; Secure; SameSite=Lax; Expires=${expires}`,
  );
  response.headers.append(
    "Set-Cookie",
    `omnistrate_token=rmvd; Path=/; Domain=${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}; Secure; SameSite=Lax; Expires=${expires}`,
  );
  response.headers.set("Access-Control-Expose-Headers", "Set-Cookie");

  return response;
};
