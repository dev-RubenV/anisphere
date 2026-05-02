/**
 * Helper de autenticação server-side.
 * Resolve o utilizador autenticado a partir do cookie httpOnly,
 * eliminando a dependência de userId enviado pelo cliente no body.
 */
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

/**
 * Lê o cookie httpOnly 'userId' e resolve o utilizador correspondente no MongoDB.
 * Suporta tanto MongoDB ObjectId como Firebase UID.
 *
 * @returns {object|null} Documento do utilizador ou null se não autenticado
 */
export async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return null;

    const client = await clientPromise;
    const usersCollection = client.db("anisphere").collection("users");

    // Tenta primeiro como MongoDB ObjectId
    let user = null;
    if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
        user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    }

    // Se não encontrou, tenta como Firebase UID
    if (!user) {
        user = await usersCollection.findOne({ firebaseUid: userId });
    }

    return user;
}

/**
 * Retorna o userId adequado para queries em coleções como watchlist/suggestions.
 * Para utilizadores MongoDB usa _id, para Firebase usa firebaseUid.
 *
 * @param {object} user - Documento do utilizador do MongoDB
 * @returns {string} userId para usar em queries
 */
export function getUserIdForStorage(user) {
    return user.firebaseUid || user._id.toString();
}
