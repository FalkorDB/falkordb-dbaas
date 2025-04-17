import { axiosClient } from "../../../../axios";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (nextRequest: NextRequest) => {
  const query = new URLSearchParams(nextRequest.nextUrl.search);
  const code = query.get("code");
  const state = JSON.parse(Buffer.from(query.get("state") ?? '', "base64").toString("utf-8"));

  let authRequestPayload = null;

  const saasDomainURL = process.env.NEXT_PUBLIC_BASE_URL;
  if ((state === "google-auth" || state?.['identityProvider'] === "Google") && code) {
    const authorizationCode = code;
    authRequestPayload = {
      authorizationCode,
      identityProviderName: "Google",
      redirectUri: `${saasDomainURL}/api/auth/idp-auth`,
    };
  } else if (state === "github-auth" && code) {
    const authorizationCode = code;
    authRequestPayload = {
      authorizationCode,
      identityProviderName: "GitHub",
    };
  }

  if (authRequestPayload) {
    try {
      const response = await axiosClient.post(
        "https://api.omnistrate.cloud/2022-09-01-00/customer-login-with-identity-provider",
        authRequestPayload
      );

      return NextResponse.redirect(saasDomainURL + "/grafana", {
        status: 302,
        headers: {
          "Set-Cookie": `token=${response.data.jwtToken}; Path=/; Domain: ${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax`,
          "Access-Control-Expose-Headers": "Set-Cookie",
        },
      });
    } catch (err) {
      console.log("IDP AUTH err", err);
    }
  }

  return NextResponse.redirect(saasDomainURL + "/signin", {
    status: 302,
    headers: {
      "Set-Cookie": `token=; Path=/; Max-Age=0`,
      "Access-Control-Expose-Headers": "Set-Cookie",
    },
  });
}
