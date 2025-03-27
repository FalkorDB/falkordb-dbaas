"use client";
import { Box, Stack, Typography, Link } from "@mui/material";
import DisplayHeading from "@repo/ui/components/DisplayHeading/DisplayHeading";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Page() {
  const { data: session } = useSession();

  if (session) {
    signOut().then(() => {
      redirect("/signin");
    });
  } else {
    console.warn("No session found, redirecting to /signin");
    redirect("/signin");
  }

  return (
    <Box>
      <DisplayHeading mt="12px">Sign out</DisplayHeading>
      <Typography>You have been signed out.</Typography>
    </Box>
  );
}
