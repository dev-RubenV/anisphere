/**
 * Helper de autenticação server-side.
 * Suporta autenticação dual:
 *  1. Bearer Token (JWT) — para clientes móveis (iOS/Android)
 *  2. Cookie httpOnly — para o web app (Next.js)
 *
 * O Bearer Token é verificado primeiro; se ausente, recorre ao cookie.
 */
import { cookies, headers } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

/**
 * Extrai o token Bearer do header Authorization.
 * @returns {string|null} Token JWT ou null
 */
async function getBearerToken() {
    const headerStore = await headers();
    const auth = headerStore.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
        return auth.slice(7);
    }
    return null;
}

/**
 * Resolve o utilizador autenticado.
 * Estratégia dual:
 *  1. Verifica Bearer Token (JWT) no header Authorization
 *  2. Fallback: lê cookie httpOnly 'userId'
 *
 * @returns {object|null} Documento do utilizador ou null se não autenticado
 */
export async function getAuthenticatedUser() {
    const client = await clientPromise;
    const usersCollection = client.db("anisphere").collection("users");

    // --- Estratégia 1: Bearer Token (JWT) ---
    const bearerToken = await getBearerToken();
    if (bearerToken) {
        const payload = verifyToken(bearerToken);
        if (payload && payload.userId) {
            const user = await resolveUserById(usersCollection, payload.userId);
            if (user) return user;
        }
        // Token inválido ou utilizador não encontrado: não recorre ao cookie
        return null;
    }

    // --- Estratégia 2: Cookie httpOnly ---
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return null;

    return resolveUserById(usersCollection, userId);
}

/**
 * Resolve um utilizador pelo ID (MongoDB ObjectId ou Firebase UID).
 *
 * @param {import('mongodb').Collection} collection - Coleção de utilizadores
 * @param {string} userId - ID do utilizador
 * @returns {object|null} Documento do utilizador ou null
 */
async function resolveUserById(collection, userId) {
    // Tenta primeiro como MongoDB ObjectId
    let user = null;
    if (ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId) {
        user = await collection.findOne({ _id: new ObjectId(userId) });
    }

    // Se não encontrou, tenta como Firebase UID
    if (!user) {
        user = await collection.findOne({ firebaseUid: userId });
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
