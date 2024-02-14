"use client"

import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from 'react';
import Spinning from '../components/spinning';
import Providers from './providers';

export default function Page() {
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

    // Render the sign-in page
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
                <Suspense>
                    <Providers />
                </Suspense>
            </main>
        </div>
    );
}

