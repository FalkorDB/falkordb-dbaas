import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const redirectToSignIn = () => {
    // Prevent Redirecting to the Same Page
    if (path.startsWith("/signin")) return;

    const redirectPath = "/signin";

    const response = NextResponse.redirect(new URL(redirectPath, request.url));
    response.headers.set(`x-middleware-cache`, `no-cache`);
    return response;
  };

  const cookies = request.cookies.get("token");

  if (
    (path !== "/grafana/login" || !path.startsWith("/grafana/public")) &&
    (!cookies || !path || path === "/")
  ) {
    return redirectToSignIn();
  }

  const response = NextResponse.next();
  response.headers.set(`x-middleware-cache`, `no-cache`);
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/).*)"],
};
