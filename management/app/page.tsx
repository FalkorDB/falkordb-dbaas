"use client"

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import Spinning from "./components/spinning";
import SingInProviders from "./components/SinginProviders";

export default function Home() {

  const { status } = useSession();
  const router = useRouter();

  // Redirect to home page if already signed in
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Render a loading message while checking the session
  if (status === 'loading') {
    return <Spinning text="Loading..." />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-400 dark:bg-gray-800">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <Suspense>
          <SingInProviders />
        </Suspense>
      </main>
    </div>
  );
}
