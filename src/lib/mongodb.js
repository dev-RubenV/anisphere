/**
 * ============================================================================
 * CONFIGURAÇÃO DO MONGODB
 * ============================================================================
 * 
 * Este ficheiro configura a conexão com o MongoDB.
 * Usa o padrão de conexão singleton para reutilizar a mesma conexão.
 * 
 * Funcionalidades:
 * - Conexão com MongoDB (local ou Atlas)
 * - Gestão de conexão em desenvolvimento vs produção
 * - Reutilização de conexão para melhor performance
 * 
 * ============================================================================
 */

// Importa o MongoClient do driver oficial do MongoDB para Node.js
import { MongoClient } from "mongodb";

/**
 * URI de conexão com o MongoDB
 * Obtida das variáveis de ambiente (.env)
 * Exemplo local: mongodb://localhost:27017
 * Exemplo Atlas: mongodb+srv://user:pass@cluster.mongodb.net/
 */
const uri = process.env.MONGODB_URI;

/**
 * Opções de configuração do cliente MongoDB
 * Pode incluir configurações como:
 * - useNewUrlParser: true
 * - useUnifiedTopology: true
 * - maxPoolSize: número máximo de conexões
 */
const options = {};

// Variáveis para armazenar o cliente e a promessa de conexão
let client;
let clientPromise;

/**
 * Validação da variável de ambiente
 * Se MONGODB_URI não estiver definida, lança um erro informativo
 */
if (!uri) {
  throw new Error("Por favor, adiciona MONGODB_URI ao ficheiro .env");
}

/**
 * Gestão de conexão baseada no ambiente
 * 
 * DESENVOLVIMENTO:
 * - Usa uma variável global para preservar a conexão entre hot reloads
 * - Evita criar múltiplas conexões durante o desenvolvimento
 * - global._mongoClientPromise persiste mesmo quando o código é recarregado
 * 
 * PRODUÇÃO:
 * - Cria uma nova conexão
 * - Cada instância do servidor tem sua própria conexão
 */
if (process.env.NODE_ENV === "development") {
  // Em desenvolvimento: verifica se já existe uma conexão global
  if (!global._mongoClientPromise) {
    // Se não existe, cria um novo cliente e conecta
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  // Usa a conexão global existente
  clientPromise = global._mongoClientPromise;
} else {
  // Em produção: cria sempre uma nova conexão
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Exporta a promessa de conexão
 * 
 * Uso em outros ficheiros:
 * const client = await clientPromise;
 * const db = client.db("nome_da_base");
 * const collection = db.collection("nome_da_colecao");
 */
export default clientPromise;
