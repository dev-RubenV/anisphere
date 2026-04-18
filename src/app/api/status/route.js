import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

/**
 * Endpoint: GET /api/status
 */
export async function GET() {
  try {
    // Verifica se a variável de ambiente existe
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI não definida");
    }

    // =============================================
    // TENTATIVA DE CONEXÃO
    // =============================================

    // Cria um novo cliente apenas para este teste
    const client = new MongoClient(process.env.MONGODB_URI);

    // Tenta conectar
    await client.connect();

    // Fecha a conexão imediatamente (sucesso)
    await client.close();

    // =============================================
    // RESPOSTA: ONLINE (200)
    // =============================================
    return NextResponse.json({ online: true }, { status: 200 });

  } catch (error) {
    console.error("Erro no status check:", error);

    // =============================================
    // RESPOSTA: OFFLINE (500)
    // =============================================
    return NextResponse.json({ online: false }, { status: 500 });
  }
}