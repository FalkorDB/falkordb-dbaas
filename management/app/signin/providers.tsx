"use client"

import { Github } from "@/components/icons/github";
import { Google } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export function Providers() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/'

    // If the user is redirected to this page because of a sign-in error,
    // the error query parameter will be set
    const error = searchParams.get('error')

    return (
        <div className="flex flex-col space-y-6 p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
            <h1 className="text-3xl font-bold">Sign in to your account</h1>
            <Button className='flex flex-row text-xl p-6 space-x-2' onClick={() => signIn('github', { callbackUrl })}>
                <Github />
                <p>Sign in with GitHub</p>
            </Button>
            <Button className='flex flex-row text-xl p-6 space-x-2' onClick={() => signIn('google', { callbackUrl })}>
                <Google />
                <p>Sign in with Google</p>
            </Button>{/*  */}
            {error &&
                <div className="bg-red-600 text-white py-2 px-4 text-left rounded-lg text-base">
                    <p>To confirm your identity, sign in with</p>
                    <p>the same account you used originally.</p>
                </div>
            }
        </div>
    )
}