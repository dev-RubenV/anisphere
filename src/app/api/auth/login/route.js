import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { setAuthCookie } from "@/lib/cookies";
import { signToken } from "@/lib/jwt";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Barreira contra NoSQL injection — garante que ambos são strings
        if (typeof email !== "string" || typeof password !== "string") {
            return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
        }

        const client = await clientPromise;
        const user = await client.db("anisphere").collection("users").findOne({ email: email.toLowerCase() });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
        }

        // Atualiza último login
        await client.db("anisphere").collection("users").updateOne(
            { _id: user._id },
            { $set: { lastLoginAt: new Date() } }
        );

        // Cookie para o web app (mantém compatibilidade)
        const cookieStore = await cookies();
        setAuthCookie(cookieStore, user._id.toString());

        // JWT para clientes móveis
        const userId = user.firebaseUid || user._id.toString();
        const token = signToken(userId, user.displayName);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: userId,
                email: user.email,
                displayName: user.displayName,
                isPublic: user.isPublic ?? true,
                provider: user.provider || "mongodb"
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}