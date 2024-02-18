"use client"


import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-10">
                <h1 className="text-8xl">Welcome</h1>
                <div className="flex flex-row space-x-5">
                    <Link href="/dashboard/databases/new" passHref>
                        <Button className="text-2xl p-10 border">
                            Create Database
                        </Button>
                    </Link>
                    <Link href="/dashboard/databases/sample" passHref>
                        <Button className="text-2xl p-10 border">
                            Load Sample
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}