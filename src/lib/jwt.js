/**
 * Utilitários JWT para autenticação via Bearer Token.
 * Complementa a autenticação por cookie existente, permitindo
 * que clientes móveis (iOS/Android) se autentiquem sem cookies.
 */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Por favor, adiciona JWT_SECRET ao ficheiro .env");
}

/**
 * Gera um JWT assinado contendo o userId.
 * Expira em 7 dias (alinhado com o maxAge do cookie existente).
 *
 * @param {string} userId - MongoDB ObjectId ou Firebase UID
 * @param {string} [displayName] - Nome de exibição do utilizador
 * @returns {string} Token JWT assinado
 */
export function signToken(userId, displayName) {
    return jwt.sign(
        { userId, displayName },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

/**
 * Verifica e descodifica um JWT.
 *
 * @param {string} token - Token JWT a verificar
 * @returns {{ userId: string, displayName?: string } | null} Payload ou null se inválido
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}
