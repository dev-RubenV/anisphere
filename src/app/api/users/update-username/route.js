import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getAuthenticatedUser } from "@/lib/auth";
import { escapeRegExp } from "@/lib/utils";


export async function POST(request) {

    try {
        // Autenticação via cookie httpOnly — nunca confiar no email do body
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { newUsername, password } = await request.json();

        if (typeof newUsername !== "string" || (password && typeof password !== "string")) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        if(currentUser.provider !== "google") {
            if(!await bcrypt.compare(password, currentUser.password)){
                return NextResponse.json({ error: "Password is incorrect!" }, { status: 400 });
            }
        }

        // Escape de regex para prevenir ReDoS
        const cleanUsername = newUsername.trim();
        const safeUsername = escapeRegExp(cleanUsername);
        const usernameRegex = { $regex: new RegExp(`^${safeUsername}$`, 'i') };

        const client = await clientPromise;
        const usersCollection = client.db("anisphere").collection("users");

        const checkUsernameAvailability = await usersCollection.findOne({ displayName: usernameRegex});

        if (checkUsernameAvailability && checkUsernameAvailability._id.toString() !== currentUser._id.toString()) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        await usersCollection.updateOne(
            {_id: currentUser._id},
            {$set: {displayName: newUsername}},
        );

        return NextResponse.json({ message: "Username updated successfully" });
    } catch (error) {
        console.error("Update username error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}