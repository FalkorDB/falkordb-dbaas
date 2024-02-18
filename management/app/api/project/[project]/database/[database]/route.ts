import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const body = await request.json();

    return NextResponse.json({ body }, { status: 200 })

}

export async function POST(request: NextRequest) {
    const body = await request.json();

    return NextResponse.json({ body }, { status: 201 })

}