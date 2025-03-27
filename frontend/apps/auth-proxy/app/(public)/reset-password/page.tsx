"use client";

import * as Yup from "yup";
import Image from "next/image";
import { useFormik } from "formik";
import { Box, Stack } from "@mui/material";
import { useRef, useState } from "react";
import axios from 'axios'
import useSnackbar from "../../../lib/hooks/useSnackbar";
import ReCAPTCHA from "react-google-recaptcha";

import Logo from "@repo/ui/components/Logo/Logo";
import { Text } from "@repo/ui/components/Typography/Typography";
import DisplayHeading from "@repo/ui/components/DisplayHeading/DisplayHeading";
import PageDescription from "@repo/ui/components/PageDescription/PageDescription";
import TextField from "@repo/ui/components/FormElements/TextField";
import FieldLabel from "@repo/ui/components/FormElements/FieldLabel";
import SubmitButton from "@repo/ui/components/FormElements/SubmitButton";
import FieldContainer from "@repo/ui/components/FormElements/FieldContainer";
import Confetti from "../../../public/assets/images/confetti.svg";

const resetPasswordValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const ResetPasswordPage = () => {

  const googleReCaptchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY ?? ""

  const reCaptchaRef = useRef<ReCAPTCHA>(null);

  const snackbar = useSnackbar();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [hasCaptchaErrored, setHasCaptchaErrored] = useState(false);

  async function handleFormSubmit(values: { email: string }) {
    try {

      let reCaptchaToken = "";
      if (!!googleReCaptchaSiteKey && reCaptchaRef.current && !hasCaptchaErrored) {
        reCaptchaToken = await reCaptchaRef.current.executeAsync() ?? "";
        reCaptchaRef.current.reset();
      } else {
        throw new Error("reCaptcha failed to load");
      }

      await axios.post('/api/auth/reset-password', { email: values.email, reCaptchaToken });

      setShowSuccess(true);
    } catch (error) {
      snackbar.showError(
        (error as any).message || "An error occurred. Please try again later."
      );
    }
  }

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
    validationSchema: resetPasswordValidationSchema,
  });

  const { values, touched, errors, handleChange, handleBlur, handleSubmit, isValid, isSubmitting } = formik;

  if (showSuccess) {
    return (
      <>
        <Stack gap="16px">
          <Image
            src={Confetti}
            alt="Confetti"
            width={265}
            height={140}
            style={{ margin: "0 auto" }}
          />

          <DisplayHeading>
            Check Your Email for a Password Reset Link
          </DisplayHeading>
          <PageDescription>
            If an account is associated with the provided email, a password
            reset link will be sent. Please follow the instructions to reset
            your password.
          </PageDescription>
          <SubmitButton href="/signin">Go to Login</SubmitButton>

          <Text
            size="small"
            weight="medium"
            color="#4B5563"
            style={{ textAlign: "center" }}
          >
            Didn&apos;t get a reset password link?{" "}
            <span
              onClick={() => setShowSuccess(false)}
              style={{ color: "#5925DC", cursor: "pointer" }}
            >
              Try again
            </span>
          </Text>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Box textAlign="center">
        <Logo
          src="/assets/images/logo.png"
          alt="FalkorDB Logo"
          style={{ width: "120px", height: "auto", maxHeight: "unset" }}
        />
      </Box>
      <Stack component="form" gap="32px" onSubmit={handleSubmit}>
        <Stack gap="16px">
          <DisplayHeading>Reset your password</DisplayHeading>
          <PageDescription>
            Enter your email address and we&apos;ll send you password reset
            instructions.
          </PageDescription>
        </Stack>
        <FieldContainer>
          <FieldLabel required>Registered Email</FieldLabel>
          <TextField
            name="email"
            id="email"
            placeholder="Input your registered email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
          />
        </FieldContainer>
        <SubmitButton
          type="submit"
          disabled={!isValid || (!!googleReCaptchaSiteKey && !isScriptLoaded)}
          loading={isSubmitting}
        >
          Submit
        </SubmitButton>
        {!!googleReCaptchaSiteKey && (
          // @ts-ignore
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
      </Stack>
    </>
  );
};

export default ResetPasswordPage;
