import { connectToDB } from "@/utils/mongoDB";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        await connectToDB()
        return NextResponse.json({message: 'Success'}, {status: 200})
    }
    catch (error) {
        return NextResponse.json({message: 'Error', error: `${error}`}, {status: 500})
    }
}