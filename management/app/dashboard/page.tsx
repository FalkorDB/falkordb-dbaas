"use client"

import { Button } from "@/components/ui/button";

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-10">
                <h1 className="text-8xl">Welcome</h1>
                <div className="flex flex-row space-x-5">   
                    <Button className="text-2xl p-10">Create Database</Button>
                    <Button className="text-2xl p-10">Load Sample</Button>
                </div>
            </main>
        </div>
    );
}