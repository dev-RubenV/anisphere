/**
 * ============================================================================
 * CONFIGURAÇÃO DO FIREBASE
 * ============================================================================
 * 
 * Este ficheiro configura e inicializa o Firebase para autenticação.
 * O Firebase é usado para o login com Google (OAuth).
 * 
 * Funcionalidades:
 * - Inicialização do Firebase App
 * - Configuração do Firebase Authentication
 * - Exportação do objeto auth para usar noutros ficheiros
 * 
 * ============================================================================
 */

// Importa funções do Firebase SDK
// initializeApp: Inicializa a aplicação Firebase
// getApps: Retorna lista de apps Firebase já inicializadas (evita duplicações)
import { initializeApp, getApps } from "firebase/app";

// getAuth: Obtém a instância de autenticação do Firebase
import { getAuth } from "firebase/auth";

/**
 * Objeto de configuração do Firebase
 * Todas as variáveis vêm do ficheiro .env (variáveis de ambiente)
 * NEXT_PUBLIC_ é necessário para variáveis acessíveis no cliente (browser)
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,               // Chave da API Firebase
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,       // Domínio de autenticação
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,         // ID do projeto Firebase
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Bucket de armazenamento
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // ID do remetente
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,                 // ID da aplicação
};

/**
 * Inicialização do Firebase App
 * 
 * Verifica se já existe uma app inicializada para evitar erros de duplicação.
 * Isto é importante no Next.js devido ao Hot Module Replacement (HMR) em desenvolvimento,
 * que pode tentar inicializar o Firebase múltiplas vezes.
 * 
 * - getApps().length === 0: Se não há apps inicializadas
 * - initializeApp(firebaseConfig): Inicializa nova app
 * - getApps()[0]: Retorna a app já existente
 */
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Obtém a instância de autenticação
 * Esta instância é usada para todas as operações de autenticação:
 * - Login com Google
 * - Logout
 * - Verificação de estado de autenticação
 */
const auth = getAuth(app);

// Exporta a app e auth para serem usados noutros ficheiros
export { app, auth };
