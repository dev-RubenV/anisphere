import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { setAuthCookie } from "@/lib/cookies";
import { generateFromEmail, generateUsername, uniqueUsernameGenerator, adjectives, nouns } from "unique-username-generator";

export async function POST(request) {
    try {
        // 1. Receber os dados que vêm do Frontend (Firebase)
        const { uid, email, displayName, photoURL, provider } = await request.json();

        // Validação simples
        if (!uid || !email) {
            return NextResponse.json({ error: "UID and email are required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("anisphere");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({ firebaseUid: uid });

        // Bloquear criação de novas contas se registos estiverem desativados
        if (!existingUser && process.env.ALLOW_ACCOUNT_CREATION === "0") {
            return NextResponse.json({ error: "Registrations are currently disabled" }, { status: 403 });
        }
        let generatedUsername;
        let isUnique = false;

        // se utilizador não existir, atribuir username aleatório
        if(!existingUser) {
            do{
                generatedUsername = uniqueUsernameGenerator({
                    dictionaries: [adjectives, nouns],
                    separator: "",
                    style: "titleCase", // <--- Força as letras maiúsculas!
                    randomDigits: 4,
                    length: 30
                });
                const existingUsername = await usersCollection.findOne({ displayName: generatedUsername });
                if(!existingUsername) isUnique = true;
            } while(!isUnique);
        }

        // 2. UPSERT (Update + Insert)
        // Se o utilizador já existe (pelo ID do Firebase), atualizamos os dados.
        // Se não existe, criamos um novo.
        const result = await usersCollection.updateOne(
            { firebaseUid: uid }, // Filtro: procura por este ID
            {
                $set: {
                    photoURL: photoURL || null,
                    updatedAt: new Date(),
                    lastLoginAt: new Date(),
                },
                $setOnInsert: {
                    isPublic: true,
                    email: email, // Só define isto se for criar um novo
                    displayName: generatedUsername || null,
                    firebaseUid: uid,
                    createdAt: new Date(),
                    provider: provider || "google",
                },
            },
            { upsert: true } // A opção que cria se não existir
        );

        //Definir um cookie que o servidor consegue ler depois
        const cookieStore = await cookies();
        setAuthCookie(cookieStore, uid);

        // 3. Fetch the updated user to return isPublic
        const updatedUser = await usersCollection.findOne(
            { firebaseUid: uid },
            { projection: { displayName: 1, email: 1, isPublic: 1, photoURL: 1, createdAt: 1, _id: 0 } }
        );

        // 4. Responder ao cliente
        return NextResponse.json({
            success: true,
            message: result.upsertedCount > 0 ? "User Created" : "User Updated",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Erro no sync:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}