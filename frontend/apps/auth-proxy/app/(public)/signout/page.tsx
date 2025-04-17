"use client";
import { Box, Stack, Typography, Link } from "@mui/material";
import DisplayHeading from "@repo/ui/components/DisplayHeading/DisplayHeading";
import { redirect } from "next/navigation";
import Cookie from 'js-cookie';
import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    console.log("Get cookie before", Cookie.get("token"));
    Cookie.remove("token", {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      sameSite: "Lax",
      secure: true,
      path: "/",
    });
    console.log("Get cookie after", Cookie.get("token"));
    redirect("/signin");
  }, []);

  return (
    <Box>
      <DisplayHeading mt="12px">Sign out</DisplayHeading>
      <Typography>You have been signed out.</Typography>
    </Box>
  );
}
