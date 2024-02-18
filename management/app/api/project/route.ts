import { NextRequest, NextResponse } from "next/server"

const projects = ["project1", "project2", "project3"]

export async function GET() {
    return NextResponse.json({ projects }, { status: 200 })

}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const project = projects.find(p => p === body.project)
    if(!project) {
        projects.push(body.project)
    }

    return NextResponse.json({ projects }, { status: 201 })

}