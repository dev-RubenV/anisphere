import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { setAuthCookie } from "@/lib/cookies";
import { escapeRegExp } from "@/lib/utils";

export async function POST(request) {
    try {
        const { email, password, displayName } = await request.json();

        if(process.env.ALLOW_ACCOUNT_CREATION) return NextResponse.json({ error: "Registrations are currently disabled"}, {status: 400})

        if (!email || !displayName || !password || password.length < 6) {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        // Barreira contra NoSQL injection
        if (typeof email !== "string" || typeof password !== "string" || typeof displayName !== "string") {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("anisphere");

        // Verifica emails duplicados
        const existingEmail = await db.collection("users").findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return NextResponse.json({ error: "Email já registado" }, { status: 400 });
        }

        // Verifica username duplicado (com escape de regex para prevenir ReDoS)
        const cleanUsername = displayName.trim();
        const safeUsername = escapeRegExp(cleanUsername);
        const usernameRegex = { $regex: new RegExp(`^${safeUsername}$`, 'i') };

        const checkUsernameAvailability = await db.collection("users").findOne({ displayName: usernameRegex});

        if (checkUsernameAvailability) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await db.collection("users").insertOne({
            email: email.toLowerCase(),
            password: hashedPassword,
            displayName: displayName,
            isPublic: true,
            provider: "mongodb",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const user = await client.db("anisphere").collection("users").findOne({ email: email.toLowerCase() });

        await client.db("anisphere").collection("users").updateOne(
            { _id: user._id },
            { $set: { lastLoginAt: new Date() } }
        );

        const cookieStore = await cookies();
        setAuthCookie(cookieStore, user._id.toString());

        return NextResponse.json({
            success: true,
            user: { id: result.insertedId, email }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}