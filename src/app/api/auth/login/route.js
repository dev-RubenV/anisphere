import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        const client = await clientPromise;
        const user = await client.db("anilog").collection("users").findOne({ email: email.toLowerCase() });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
        }

        // Atualiza último login
        await client.db("anilog").collection("users").updateOne(
            { _id: user._id },
            { $set: { lastLoginAt: new Date() } }
        );

        const cookieStore = await cookies();
        cookieStore.set({
            name: 'userId',
            value: user._id.toString(),
            httpOnly: true, // Mais segurança
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                provider: "mongodb"
            }
        });

    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}