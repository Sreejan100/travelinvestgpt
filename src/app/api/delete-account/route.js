import {useSession, signOut} from "next-auth/react";
// import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Email from "next-auth/providers/email";
import { cloudinary } from "@/lib/cloudinary";



export async function POST(req) {

try {
    const email = await req.text();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;
    await cloudinary.uploader.destroy(`user_profiles/user_${userId}`);
    // Run a transaction to delete all related data safely
    await prisma.$transaction([
      prisma.session.deleteMany({
        where: { userId },
      }),
      prisma.account.deleteMany({
        where: { userId },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: email },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    return NextResponse.json({ success: true, deletedUserId: userId });
  } catch (error) {
    console.error("Error during user deletion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

} 




