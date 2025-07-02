"use client";
import { Box, Stack, Typography, Link } from "@mui/material";
import DisplayHeading from "@repo/ui/components/DisplayHeading/DisplayHeading";
import { redirect } from "next/navigation";
import Cookie from 'js-cookie';
import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    Cookie.remove("token", {
      path: '/',
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      secure: true,
      sameSite: 'Lax',
    });
    redirect("/signin");
  }, []);

  return (
    <Box>
      <DisplayHeading mt="12px">Sign out</DisplayHeading>
      <Typography>You have been signed out.</Typography>
    </Box>
  );
}
