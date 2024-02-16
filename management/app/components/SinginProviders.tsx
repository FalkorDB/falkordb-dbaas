"use client"

import Github from "@/components/icons/github";
import Google from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SinginProviders() {
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

    // If the user is redirected to this page because of a sign-in error,
    // the error query parameter will be set
    const error = searchParams.get('error')

    return (
        <div className="flex flex-col space-y-6 p-6  bg-zinc-200 dark:bg-slate-900 shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
            <h1 className="text-3xl font-bold">Sign in to your account</h1>
            <p className="">
                By logging in, you accept our
                <Link className="dark:text-blue-300 hover:dark:text-blue-500 text-blue-500 hover:text-blue-700" href="/terms"> terms </Link>
                and
                <Link className="dark:text-blue-300 hover:dark:text-blue-500 text-blue-500 hover:text-blue-700" href="/policy"> privacy policy</Link>.
            </p>
            <Button className='flex flex-row text-xl p-6 space-x-2 dark:text-white dark:bg-gray-800' onClick={() => signIn('github', { callbackUrl })}>
                <Github className="w-7 h-7" darkMode/>
                <p>Sign in with GitHub</p>
            </Button>
            <Button className='flex flex-row text-xl p-6 space-x-2 dark:text-white dark:bg-gray-800' onClick={() => signIn('google', { callbackUrl })}>
                <Google className="w-7 h-7" />
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