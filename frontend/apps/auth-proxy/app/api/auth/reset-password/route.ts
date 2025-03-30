import { axiosClient as axios } from "../../../../axios";
import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import { verifyRecaptchaToken } from "../../../../lib/utils/verifyRecaptchaToken";


export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    await verifyRecaptchaToken(body.reCaptchaToken ?? '');
    await axios.post("https://api.omnistrate.cloud/2022-09-01-00/customer-reset-password", {
      email: body.email
    })

    return NextResponse.json({ message: "Password reset email sent" })
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(error.response?.data)
      return NextResponse.json(error.response?.data, { status: error.response?.status ?? 400 })
    }
    console.error(error)
    return NextResponse.error()
  }
}