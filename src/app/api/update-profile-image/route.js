import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";


export async function POST(req) {

    try {

        const {image, email} = await req.json();

        if (!email || !image ) {
            return NextResponse.json({error : "Missing data"},{status: 400});
        }

        await prisma.user.update({
            where: {email},
            data: {image}
        });
        
        return NextResponse.json({ message: "Image updated" }, { status: 200 });
        } catch (err) {
            console.error("DB update error:", err);
            return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
        }

}