/**
 * Middleware Next.js para CORS.
 * Permite que clientes móveis (iOS/Android) acedam às rotas da API
 * enviando pedidos cross-origin com headers de Authorization.
 */
import { NextResponse } from "next/server";

/**
 * Aplica headers CORS a todas as rotas /api/*.
 * - Permite qualquer origem (necessário para apps móveis nativas)
 * - Permite headers Authorization e Content-Type
 * - Responde a preflight (OPTIONS) com 204
 */
export function middleware(request) {
    // Trata preflight OPTIONS
    if (request.method === "OPTIONS") {
        return new NextResponse(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // Para pedidos normais, adiciona headers CORS à resposta
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
}

/** Aplica este middleware apenas a rotas da API. */
export const config = {
    matcher: "/api/:path*",
};
