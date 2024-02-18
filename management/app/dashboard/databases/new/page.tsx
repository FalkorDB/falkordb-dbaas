"use client"

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState } from "react";

const MACHINES = [
    "m1.small",
    "m1.medium",
    "m1.large",
]


export default function Page() {

    const databaseName = useRef<HTMLInputElement>(null);
    const [machineType, setMachineType] = useState(MACHINES[0]);

    const project = "project1"

    const createDatabase = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        fetch(`/api/project/${project}/database`, {
            method: 'POST',
            body: JSON.stringify({
                name: databaseName.current?.value,
                machineType
            })
        }).then((res) => {
            if (res.ok) {
                console.log('Database created')
            } else {
                console.error('Failed to create database')
            }   
        })
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <main className="flex flex-col items-center justify-center flex-1 px-20 text-center space-y-10">
                <h1 className="text-8xl">Create a new Database</h1>
                <form className="flex flex-col space-y-10" onSubmit={createDatabase}>
                    <div className="flex flex-row space-x-4 items-center">
                        <Label className="text-4xl p-2" htmlFor="databaseName">Database Name:</Label>
                        <input className="text-4xl p-2 border-8" ref={databaseName} id="databaseName" type="text" required />
                    </div>
                    <div className="flex flex-row space-x-4 items-center">
                        <Label className="text-4xl min-w-fit p-2 text-left" htmlFor="machineType">Machine Type:</Label>
                        <Select onValueChange={setMachineType} defaultValue={MACHINES[0]}>
                            <SelectTrigger id="machineType" className="text-4xl p-8 border-8" >
                                <SelectValue placeholder="Machine type" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    MACHINES.map((item) => (
                                        <SelectItem className="text-4xl" key={item} value={item}>{item}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="p-8 text-4xl">Create</Button>
                </form>
            </main>
        </div>
    )
}