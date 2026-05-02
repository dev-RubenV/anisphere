/**
 * Helper para definir o cookie de autenticação com flags de segurança.
 * Centraliza a configuração para garantir consistência em todas as rotas.
 *
 * @param {object} cookieStore - Instância de cookies do Next.js
 * @param {string} userId - ID do utilizador (MongoDB ObjectId ou Firebase UID)
 */
export function setAuthCookie(cookieStore, userId) {
    cookieStore.set({
        name: 'userId',
        value: userId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
    });
}
