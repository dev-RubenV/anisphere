import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";


export async function POST(request) {

    try {
        const { newUsername, password, email} = await request.json();

        if (typeof email !== "string" || newUsername !== "string" || (password && typeof password !== "string")) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const client = await clientPromise;
        const usersCollection = await client.db("anilog").collection("users");
        const currentUser = await usersCollection.findOne({email: email});


        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if(currentUser.provider !== "google") {
            if(!await bcrypt.compare(password, currentUser.password)){
                return NextResponse.json({ error: "Password is incorrect!" }, { status: 400 });
            }
        }

        const cleanUsername = newUsername.trim();
        const usernameRegex = { $regex: new RegExp(`^${cleanUsername}$`, 'i') };

        const checkUsernameAvailability = await usersCollection.findOne({ displayName: usernameRegex});

        if (checkUsernameAvailability && checkUsernameAvailability._id.toString() !== currentUser._id.toString()) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        await usersCollection.updateOne(
            {email: email},
            {$set: {displayName: newUsername}},
        );

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'userId',
            value: currentUser._id.toString(),
            httpOnly: true, // Mais segurança
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        });

        return NextResponse.json({ message: "Username updated successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}