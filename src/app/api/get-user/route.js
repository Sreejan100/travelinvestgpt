import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req) {
    const {searchParams} = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({error: "Missing email"},{status: 400});
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { image: true },
        });

        if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

    return NextResponse.json({ image: user.image }, { status: 200 });

    }catch(err){
        console.log("DB fetch failed: ", err);
        return NextResponse.json({error: "Server error"},{status: 500});
    }


}