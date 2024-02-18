"use client"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info, Monitor } from "lucide-react";
import { useState } from "react";

interface Sample {
    name: string;
    description: string;
    machine: string;
}

const SAMPLES: Sample[] = [
    {
        name: "Sample 1",
        description: "This is a sample data description 1",
        machine: "m1.small"
    },
    {
        name: "Sample 2",
        description: "This is a sample data description 2",
        machine: "m1.small"
    },
    {
        name: "Sample 3",
        description: "This is a sample data description 3",
        machine: "m1.small"
    }
]


export default function Page() {

    const [sample, setSample] = useState(SAMPLES[0].name);

    const project = "project1"

    const createDatabase = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        fetch(`/api/project/${project}/database`, {
            method: 'POST',
            body: JSON.stringify({
                sample
            })
        }).then((res) => {
            if (res.ok) {
                console.log('Sample loaded')
            } else {
                console.error('Failed to load sample')
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
                        <Select onValueChange={setSample} defaultValue={SAMPLES[0].name}>
                            <SelectTrigger id="machineType" className="text-4xl p-8 border-8" >
                                <SelectValue placeholder="Sample" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    SAMPLES.map((item) => (
                                        <SelectItem className="text-4xl" key={item.name} value={item.name}>{item.name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    {sample &&
                        <div>
                            <div className="p-8 text-4xl flex flex-row items-center space-x-2">
                                <Info />
                                <div>{SAMPLES.find((s) => s.name === sample)?.description}</div>
                            </div>
                            <div className="p-8 text-4xl flex flex-row items-center space-x-2">
                                <Monitor />
                                <div>{SAMPLES.find((s) => s.name === sample)?.machine}</div>
                            </div>
                        </div>

                    }
                    <Button className="p-8 text-4xl">Load Sample</Button>
                </form>
            </main>
        </div>
    )
}