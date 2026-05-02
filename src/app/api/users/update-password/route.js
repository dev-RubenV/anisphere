import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/lib/auth";


export async function POST(request) {
    try{
        // Autenticação via cookie httpOnly — nunca confiar no email do body
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { newPassword, password } = await request.json();

        // Barreira de segurança para prevenir Operator Injections
        if (
            typeof password !== "string" ||
            typeof newPassword !== "string"
        ) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        if(newPassword === password){
            return NextResponse.json({ error: "Password needs to be different from the original" }, {status: 400});
        }

        if(currentUser.provider === "google") {
            return NextResponse.json({ error: "Google accounts do not require a password" }, { status: 400 });
        }

        if(!await bcrypt.compare(password, currentUser.password)){
            return NextResponse.json({ error: "Password is incorrect!" }, { status: 400 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        const client = await clientPromise;
        const usersCollection = client.db("anisphere").collection("users");

        await usersCollection.updateOne(
            {_id: currentUser._id},
            {$set: { password: hashedNewPassword } },
        );

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Update password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}