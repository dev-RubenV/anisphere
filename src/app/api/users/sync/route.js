import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function POST(request) {
    try {
        // 1. Receber os dados que vêm do Frontend (Firebase)
        const { uid, email, displayName, photoURL, provider } = await request.json();

        // Validação simples
        if (!uid || !email) {
            return NextResponse.json({ error: "UID and email are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("anilog");
        const usersCollection = db.collection("users");

        // 2. UPSERT (Update + Insert)
        // Se o utilizador já existe (pelo ID do Firebase), atualizamos os dados.
        // Se não existe, criamos um novo.
        const result = await usersCollection.updateOne(
            { firebaseUid: uid }, // Filtro: procura por este ID
            {
                $set: {
                    firebaseUid: uid,
                    email: email,
                    displayName: displayName || null,
                    photoURL: photoURL || null,
                    provider: provider || "google",
                    updatedAt: new Date(),
                    lastLoginAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(), // Só define isto se for criar um novo
                },
            },
            { upsert: true } // A opção que cria se não existir
        );

        //Definir um cookie que o servidor consegue ler depois
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'userId',
            value: uid,
            httpOnly: true, // Mais segurança
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        });

        // 3. Responder ao cliente
        return NextResponse.json({
            success: true,
            message: result.upsertedCount > 0 ? "User Created" : "User Updated",
        });

    } catch (error) {
        console.error("Erro no sync:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}