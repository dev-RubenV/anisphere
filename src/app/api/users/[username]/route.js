import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    // 1. Obtém o username a partir do URL
    const username = params?.username;

    if (!username) {
        return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("anisphere");

        // Define as duas coleções
        const usersCollection = db.collection("users");
        const watchlistCollection = db.collection("watchlist"); // Ajusta o nome se a tua for diferente

        // 2. Busca o perfil do utilizador PRIMEIRO
        const profileUser = await usersCollection.findOne(
            { displayName: username }, // Procura por username
            { projection: { displayName: 1, photoURL: 1, isPublic: 1, _id: 1 } }
        );

        if (!profileUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. O SEGURANÇA
        // Se o utilizador existe mas está explicitamente definido como privado
        if (profileUser.isPublic === false) {
            return NextResponse.json({
                displayName: profileUser.displayName,
                photoURL: profileUser.photoURL,
                isPublic: false,
                    watchlist: [] // <-- Bloqueado! Saltamos completamente a segunda query à base de dados.
            });
        }

        // 4. SE PÚBLICO: Vai buscar os dados da segunda coleção
        // Com base no código anterior, o anime é guardado com o username associado
        const userWatchlist = await watchlistCollection.find({
            username: username
        }).toArray();

        // 5. Envia os dados combinados de volta para o frontend
        return NextResponse.json({
            displayName: profileUser.displayName,
            photoURL: profileUser.photoURL,
            isPublic: true,
            watchlist: userWatchlist // Envia o array real que acabámos de obter
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}