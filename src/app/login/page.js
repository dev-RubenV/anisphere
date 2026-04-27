/**
 * ============================================================================
 * PÁGINA DE LOGIN E REGISTO
 * ============================================================================
 *
 * Esta página permite aos utilizadores autenticarem-se na aplicação.
 * Suporta dois métodos de autenticação:
 *
 * 1. Email/Password (MongoDB)
 *    - Credenciais guardadas no MongoDB
 *    - Password encriptada com bcrypt
 *    - Permite registo de novos utilizadores
 *
 * 2. Google OAuth (Firebase)
 *    - Autenticação via conta Google
 *    - Dados sincronizados com MongoDB
 *    - Login com um clique
 *
 * Funcionalidades:
 * - Formulário de login
 * - Formulário de registo (toggle)
 * - Login com Google
 * - Validação de campos
 * - Mensagens de erro
 * - Redirecionamento após login bem-sucedido
 *
 * ============================================================================
 */
'use client'

import Image from "next/image"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// Importações do React
import { useState } from "react";

// Hook de navegação do Next.js
import { useRouter } from "next/navigation";

// Necessário para mudar o título dinamicamente
import { useEffect } from "react";

// Componente para modificar o <head> da página
import Head from "next/head";

// Hook de autenticação personalizado
import { useAuth } from "@/context/AuthContext";

// Estilos CSS Module da página de login
import styles from "@/app/login/Login.module.css";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {HelpCircle} from "lucide-react";

/**
 * Componente da Página de Login
 */
export default function Login() {
    // =============================================
    // ESTADOS DO FORMULÁRIO
    // =============================================

    // Valor do campo email
    const [email, setEmail] = useState("");

    const [displayName, setdisplayName] = useState("");

    // Valor do campo password
    const [password, setPassword] = useState("");

    // Toggle entre modo login (false) e registo (true)
    const [isRegister, setIsRegister] = useState(false);

    // Mensagem de erro a mostrar
    const [error, setError] = useState("");

    // Estado de carregamento (desativa botões durante processamento)
    const [loading, setLoading] = useState(false);

    // =============================================
    // HOOKS
    // =============================================

    // Funções de autenticação do contexto
    const { login, register, loginWithGoogle } = useAuth();

    // Hook de navegação
    const router = useRouter();

    // =============================================
    // HANDLERS
    // =============================================

    /**
     * Handler do submit do formulário (Login ou Registo)
     *
     * @param {Event} e - Evento de submit do formulário
     */
    const handleSubmit = async (e) => {
        // Previne reload da página (comportamento padrão do form)
        e.preventDefault();

        // Limpa erro anterior e ativa loading
        setError("");
        setLoading(true);

        try {
            // Decide qual função chamar baseado no modo atual
            if (isRegister) {
                // Modo registo: cria nova conta
                await register(email, password, displayName);
            } else {
                // Modo login: autentica utilizador existente
                await login(email, password, displayName);
            }

            // Se sucesso, redireciona para página principal
            router.push("/");

        } catch (err) {
            // Se erro, mostra mensagem ao utilizador
            setError(err.message);

        } finally {
            // Desativa loading independentemente do resultado
            setLoading(false);
        }
    };

    /**
     * Handler do botão "Continuar com Google"
     * Inicia o fluxo de autenticação OAuth com Google
     */
    const handleGoogleLogin = async () => {
        // Limpa erro anterior e ativa loading
        setError("");
        setLoading(true);

        try {
            // Abre popup de login do Google
            await loginWithGoogle();

            // Se sucesso, redireciona para página principal
            router.push("/");

        } catch (err) {
            // Mostra erro (pode ser cancelamento do popup)
            setError(err.message || "Erro ao fazer login com Google");

        } finally {
            setLoading(false);
        }
    };

    // =============================================
    // RENDERIZAÇÃO
    // =============================================

    return (
        <>
            {/* Configuração do <head> - título dinâmico baseado no modo */}
            <Head>
                <title>{isRegister ? "Register" : "Login"} - AniSphere</title>
            </Head>

                {/* Card principal do formulário */}
                <div className={`w-full ${styles.card}`}>

                    {/* ================================
              CABEÇALHO
              Logo e título
              ================================ */}
                    <div className={`w-full ${styles.header}`}>
                        {/* Logo do MongoDB */}
                        <div className={styles.logo}>
                            <Image src="/anisphere-logo.png"
                            alt="anisphere-logo"
                            width={350}
                            height={350}/>
                        </div>

                        {/* Título dinâmico baseado no modo */}
                        <h1 className={styles.title}>
                            {isRegister ? "Create a new account" : "Welcome back!"}
                        </h1>
                        <p className={styles.subtitle}>Your personal anime tracking universe</p>
                    </div>

                    {/* ================================
              MENSAGEM DE ERRO
              Mostrada apenas quando há erro
              ================================ */}
                    {error && <div className={styles.error}>{error}</div>}

                    {/* ================================
              FORMULÁRIO DE LOGIN/REGISTO
              ================================ */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />

                                </Field>
                                {isRegister && (
                                <Field>
                                    <FieldLabel htmlFor="username">Username</FieldLabel>
                                    <Input id="username" type="text" value={displayName} onChange={(e) => setdisplayName(e.target.value)} required  />
                                </Field>
                                )}
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <FieldDescription>
                                        Must be at least 6 characters long.
                                    </FieldDescription>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
                                </Field>
                            </FieldGroup>
                        </FieldSet>

                        {/* Botão de Submit */}
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}  // Desativado durante loading
                        >
                            {/* Texto dinâmico baseado no estado */}
                            {loading
                                ? "Processing..."
                                : isRegister
                                    ? "Register"
                                    : "Login"
                            }
                        </button>
                    </form>

                    {/* ================================
              DIVISOR
              Separa os métodos de login
              ================================ */}
                    <div className={styles.divider}>
                        <span>or</span>
                    </div>

                    {/* ================================
              BOTÃO DE LOGIN COM GOOGLE
              ================================ */}
                    <button
                        onClick={handleGoogleLogin}
                        className={styles.googleBtn}
                        disabled={loading}
                    >
                        {/* Ícone do Google (SVG colorido) */}
                        <svg viewBox="0 0 24 24" className={styles.googleIcon}>
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* ================================
              TOGGLE LOGIN/REGISTO
              Permite alternar entre modos
              ================================ */}
                    <p className={styles.toggleText}>
                        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister); // Toggle do modo
                                setError("");                // Limpa erros ao mudar
                            }}
                            className={styles.toggleBtn}
                        >
                            {isRegister ? "Login" : "Register"}
                        </button>
                    </p>
                </div>
        </>
    );
}
