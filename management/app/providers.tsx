"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from 'next-themes'

type Props = {
  children: React.ReactNode
};

export default function NextAuthProvider({ children }: Props) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
};