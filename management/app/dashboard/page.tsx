"use client"

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
                <Button onClick={  ()=>signOut({ callbackUrl:"/" }) }>Sign out</Button>

                Dashboard
            </main>
        </div>
    );
}