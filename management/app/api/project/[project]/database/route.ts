import { NextRequest, NextResponse } from "next/server"

const databases = ["db1", "db1", "db3"]

export async function GET() {
    return NextResponse.json({ databases }, { status: 200 })

}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const project = databases.find(d => d === body.name)
    if(!project) {
        databases.push(body.name)
    }

    return NextResponse.json({ databases }, { status: 201 })

}