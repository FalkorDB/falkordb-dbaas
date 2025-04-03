import { axiosClient } from "../../../../axios";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (nextRequest: NextRequest) => {
  const query = new URLSearchParams(nextRequest.url);
  const code = query.get("code");
  const state = JSON.parse(Buffer.from(query.get("state") ?? '', "base64").toString("utf-8"));

  let authRequestPayload = null;

  if (state === "google-auth" && code) {
    const saasDomainURL = process.env.NEXT_PUBLIC_BASE_URL;
    const authorizationCode = code;
    authRequestPayload = {
      authorizationCode,
      identityProviderName: "Google",
      redirectUri: `${saasDomainURL}/api/idp-auth`,
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

      const jwtToken = response.data.jwtToken;
      return NextResponse.redirect("/signin", {
        status: 302,
        headers: {
          "Set-Cookie": `token=${jwtToken}; Path=/`,
          "Access-Control-Expose-Headers": "Set-Cookie",
        },
      });
    } catch (err) {
      console.log("IDP AUTH err", err);
    }
  }
}
