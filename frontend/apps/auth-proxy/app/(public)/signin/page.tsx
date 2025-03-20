"use client";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Box, Stack, Typography, Link } from "@mui/material";
import DisplayHeading from "@repo/ui/components/DisplayHeading/DisplayHeading";
import FieldContainer from "@repo/ui/components/FormElements/FieldContainer";
import FieldLabel from "@repo/ui/components/FormElements/FieldLabel";
import TextField from "@repo/ui/components/FormElements/TextField";
import SubmitButton from "@repo/ui/components/FormElements/SubmitButton";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Page() {
  const { data: session } = useSession();

  if (session) {
    redirect("/grafana");
  }

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        const res = await signIn("credentials", {
          email: values.email,
          password: values.password,
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
        </Stack>

        <SubmitButton
          type="submit"
          disabled={!isValid || isLoading}
          loading={isLoading}
        >
          {"Login"}
        </SubmitButton>
      </Stack>
    </Box>
  );
}
