import { NextApiRequest, NextApiResponse } from "next";
import { axiosClient } from "../../../../axios";

export const GET = async (nextRequest: NextApiRequest, nextResponse: NextApiResponse) => {
  const { state, code } = nextRequest.query;

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
      nextResponse.setHeader("Set-Cookie", `token=${jwtToken}; Path=/`);
      nextResponse.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
      nextResponse.redirect(307, "/signin");
    } catch (err) {
      console.log("IDP AUTH err", err);
    }
  }
}
