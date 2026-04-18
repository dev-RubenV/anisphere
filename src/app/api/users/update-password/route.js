import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";


export async function POST(request) {
    try{
        const { newPassword, password, email } = await request.json();

        // Barreira de segurança para prevenir Operator Injections
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof newPassword !== "string"
        ) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        if(newPassword === password){
            return NextResponse.json({ error: "Password needs to be different from the original" }, {status: 400});
        }

        const client = await clientPromise;
        const usersCollection = await client.db("anilog").collection("users");
        const currentUser = await usersCollection.findOne({ email: email });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if(currentUser.provider === "google") {
            return NextResponse.json({ error: "Google accounts do not require a password" }, { status: 400 });
        }

        if(!await bcrypt.compare(password, currentUser.password)){
            return NextResponse.json({ error: "Password is incorrect!" }, { status: 400 });
        }

        await usersCollection.updateOne(
        {email: email},
        {$set: { password: hashedNewPassword } },
        );

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 500});
    }
}