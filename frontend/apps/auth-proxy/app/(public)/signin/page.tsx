"use client";
import { useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Stack, Typography } from "@mui/material";
import DisplayHeading from "@repo/ui/components/DisplayHeading/DisplayHeading";
import FieldContainer from "@repo/ui/components/FormElements/FieldContainer";
import FieldLabel from "@repo/ui/components/FormElements/FieldLabel";
import TextField from "@repo/ui/components/FormElements/TextField";
import SubmitButton from "@repo/ui/components/FormElements/SubmitButton";
import Logo from "@repo/ui/components/Logo/Logo";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import GoogleLogin from "./components/GoogleLogin";
import GithubLogin from "./components/GitHubLogin";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function Page() {

  const googleReCaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY ?? ""
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ""
  const saasBuilderBaseURL = process.env.NEXT_PUBLIC_SAAS_BUILDER_BASE_URL ?? ""
  const destination = "/grafana"

  const googleIDPClientID = process.env.NEXT_PUBLIC_GOOGLE_IDP_CLIENT_ID ?? ""

  const githubIDPClientID = process.env.NEXT_PUBLIC_GITHUB_IDP_CLIENT_ID ?? ""

  const reCaptchaRef = useRef<ReCAPTCHA>(null);

  const { data: session } = useSession();

  if (session) {
    redirect("/grafana");
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [hasCaptchaErrored, setHasCaptchaErrored] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {

        let reCaptchaToken = "";
        console.log({ googleReCaptchaSiteKey, reCaptchaRef, hasCaptchaErrored });
        if (!!googleReCaptchaSiteKey && reCaptchaRef.current && !hasCaptchaErrored) {
          reCaptchaToken = await reCaptchaRef.current.executeAsync() ?? "";
          reCaptchaRef.current.reset();
        } else {
          throw new Error("reCaptcha failed to load");
        }

        const res = await signIn("credentials", {
          email: values.email,
          password: values.password,
          reCaptchaToken,
          redirect: true,
          callbackUrl: process.env.NEXT_PUBLIC_GRAFANA_URL ?? "/grafana",
        });
        console.log({ res });
        if (res?.error) {
          setErrorMessage(
            res.error ? res.error : "An error occurred. Please try again later."
          );
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(
          (error as any).message
            ? (error as any).message
            : "An error occurred. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid,
  } = formik;

  return (
    <Box>

      <Box textAlign="center">
        <Logo
          src="/assets/images/logo.png"
          alt="FalkorDB Logo"
          style={{ width: "120px", height: "auto", maxHeight: "unset" }}
        />
      </Box>

      <DisplayHeading mt="12px">Login to your account</DisplayHeading>

      {errorMessage && (
        <Typography color="error" mb={2}>
          {errorMessage}
        </Typography>
      )}

      <Stack component="form" gap="24px" mt="28px" onSubmit={handleSubmit}>
        <Stack gap="20px">
          <FieldContainer>
            <FieldLabel required>Email</FieldLabel>
            <TextField
              name="email"
              placeholder="example@companyemail.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
            />
          </FieldContainer>
          <FieldContainer>
            <FieldLabel required>Password</FieldLabel>
            <TextField
              type="password"
              name="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
            />
          </FieldContainer>
          <Link
            href="/reset-password"
            style={{
              fontWeight: "500",
              fontSize: "14px",
              lineHeight: "22px",
              color: "#687588",
            }}
          >
            Forgot Password
          </Link>
        </Stack>

        <SubmitButton
          type="submit"
          disabled={!isValid || isLoading || (!!googleReCaptchaSiteKey && !isScriptLoaded)}
          loading={isLoading}
        >
          {"Login"}
        </SubmitButton>

        {!!googleReCaptchaSiteKey && (
          <ReCAPTCHA
            size="invisible"
            sitekey={googleReCaptchaSiteKey}
            ref={reCaptchaRef}
            asyncScriptOnLoad={() => {
              setIsScriptLoaded(true);
            }}
            onErrored={() => {
              setHasCaptchaErrored(true);
            }}
          />
        )}


        {Boolean(googleIDPClientID || githubIDPClientID) && (
          <>
            <Box borderTop="1px solid #F1F2F4" textAlign="center" mt="40px">
              <Box
                display="inline-block"
                paddingLeft="16px"
                paddingRight="16px"
                color="#687588"
                bgcolor="white"
                fontSize="14px"
                fontWeight="500"
                lineHeight="22px"
                sx={{ transform: "translateY(-50%)" }}
              >
                Or login with
              </Box>
            </Box>
            <Stack direction="row" justifyContent="center" mt="20px" gap="16px">
              {!!googleIDPClientID && (
                <GoogleOAuthProvider
                  clientId={googleIDPClientID}
                  onScriptLoadError={() => { }}
                  onScriptLoadSuccess={() => { }}
                >
                  <GoogleLogin
                    saasBuilderBaseURL={baseUrl}
                    destination={destination}
                    disabled={isLoading}
                  />
                </GoogleOAuthProvider>
              )}
              {!!githubIDPClientID && (
                <GithubLogin
                  githubClientID={githubIDPClientID}
                  saasBuilderBaseURL={saasBuilderBaseURL}
                  destination={destination}
                  disabled={isLoading}
                />
              )}
            </Stack>
          </>
        )}

      </Stack>
    </Box>
  );
}
