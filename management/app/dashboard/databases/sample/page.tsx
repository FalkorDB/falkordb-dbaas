"use client"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const SAMMPLES = [
    "Sample1",
    "Sample2",
    "Sample3",
]


export default function Page() {

    const [sample, setSample] = useState(SAMMPLES[0]);

    const createDatabase = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        fetch('/api/project/database', {
            method: 'POST',
            body: JSON.stringify({
                sample
            })
        }).then((res) => {
            if (res.ok) {
                console.log('Database created')
            }
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-10">
                <h1 className="text-8xl">Loads sample data</h1>
                <form className="flex flex-col space-y-10" onSubmit={createDatabase}>
                    <div className="flex flex-row space-x-4 items-center">
                        <Label className="text-4xl min-w-fit p-2 text-left" htmlFor="machineType">Sample Data:</Label>
                        <Select onValueChange={setSample} defaultValue={SAMMPLES[0]}>
                            <SelectTrigger id="machineType" className="text-4xl p-8 border-8" >
                                <SelectValue placeholder="Sample" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    SAMMPLES.map((item) => (
                                        <SelectItem className="text-4xl" key={item} value={item}>{item}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="p-8 text-4xl">Load Sample</Button>
                </form>
            </main>
        </div>
    )
}