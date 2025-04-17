import { axiosClient } from "../../../../axios";
import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";

export const POST = async (nextRequest: NextRequest) => {

  try {
    const response = await axiosClient.post(
      "https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin",
      await nextRequest.json(),
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

    return NextResponse.json({}, {
      status: 200,
      headers: {
        "Set-Cookie": `token=${response.data.jwtToken}; Path=/; Domain=${process.env.NEXT_PUBLIC_COOKIE_DOMAIN}; HttpOnly; Secure; SameSite=Lax; Expires=${new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString()}`,
        "Access-Control-Expose-Headers": "Set-Cookie",
      },
    });
  } catch (err) {
    console.log('error during login', (err as any).response ?? err);

    return NextResponse.json({
      error: "Invalid credentials",
    }, {
      status: 401,
      headers: {
        "Set-Cookie": `token=; Path=/; Max-Age=0`,
        "Access-Control-Expose-Headers": "Set-Cookie",
      },
    });
  }

}
