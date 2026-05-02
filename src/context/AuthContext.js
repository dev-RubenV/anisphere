"use client"; // <--- OBRIGATÓRIO NO APP ROUTER

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {NextResponse as response} from "next/server"; // Ajusta o caminho se necessário

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // PASSO 1: Verifica se há utilizador guardado no localStorage (login MongoDB)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            // Se existe, restaura o utilizador e termina o carregamento
            setUser(JSON.parse(storedUser));
            setLoading(false);
            return; // Sai do effect, não precisa verificar Firebase
        }

        // PASSO 2: Verifica o Firebase Auth (login Google)
        // onAuthStateChanged é um observador que é chamado sempre que o estado muda
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Se há utilizador autenticado no Firebase, extrai os dados
                const userData = {
                    id: firebaseUser.uid,           // ID único do Firebase
                    email: firebaseUser.email,       // Email do utilizador
                    displayName: firebaseUser.displayName, // Nome de exibição
                    photoURL: firebaseUser.photoURL,  // URL da foto de perfil
                    provider: "google",              // Indica que foi login via Google
                };
                setUser(userData);

                // Sincroniza os dados do utilizador com o MongoDB
                await syncUserWithMongo(firebaseUser);
            }
            // Termina o carregamento após verificar
            setLoading(false);
        });

        // Cleanup: Remove o observador quando o componente é desmontado
        return () => unsubscribe();
    }, []); // Array vazio = executa apenas uma vez

    /**
     * Sincroniza utilizador do Google com MongoDB
     * Guarda/atualiza os dados do utilizador na base de dados
     *
     * @param {Object} firebaseUser - Objeto do utilizador do Firebase
     */
    const syncUserWithMongo = async (firebaseUser) => {
        try {

            const res = await fetch("/api/users/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    provider: "google",
                }),
            });

            const data = await res.json();

            // Se API devolver o utilizador, atualizar o estado com o isPublic do MongoDB
            if(data.user) {
                setUser((prev) => ({
                    ...prev,
                    displayName: data.user.displayName,
                    isPublic: data.user.isPublic,
                    createdAt: data.user.createdAt,
                }));
            }
        } catch (error) {
            console.error("Erro ao sincronizar com MongoDB:", error);
        }
    };

    /**
     * Login com Email e Password (MongoDB)
     * Autentica o utilizador usando credenciais guardadas no MongoDB
     *
     * @param {string} email - Email do utilizador
     * @param {string} password - Password do utilizador
     * @returns {Object} Dados da resposta da API
     * @throws {Error} Se as credenciais forem inválidas
     */
    const login = async (email, password) => {
        // Faz POST para a API de login
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // Converte a resposta para JSON
        const data = await response.json();

        // Se a resposta não for OK, lança erro
        if (!response.ok) {
            throw new Error(data.error || "Erro ao fazer login");
        }

        // Prepara os dados do utilizador com indicação do provider
        const userData = { ...data.user, provider: "mongodb" };

        // Atualiza o estado e guarda no localStorage para persistência
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        return data;
    };

    /**
     * Registo com Email e Password (MongoDB)
     * Cria uma nova conta de utilizador no MongoDB
     *
     * @param {string} email - Email do novo utilizador
     * @param {string} password - Password do novo utilizador
     * @param {string} displayName - Nome de exibição (opcional)
     * @returns {Object} Dados da resposta da API
     * @throws {Error} Se o registo falhar
     */
    const register = async (email, password, displayName) => {

        if(!process.env.ALLOW_ACCOUNT_CREATION) throw new Error("Registrations are currently disabled");

        // Faz POST para a API de registo
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, displayName }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error during registration");
        }

        // Após registo bem-sucedido, faz login automático
        const userData = { ...data.user, displayName: displayName, provider: "mongodb" };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        return data;
    };

    /**
     * Login com Google (Firebase)
     * Abre popup de autenticação do Google via Firebase
     *
     * @returns {Object} Resultado da autenticação Firebase
     * @throws {Error} Se o login for cancelado ou falhar
     */
    const loginWithGoogle = async () => {
        // Cria uma instância do provider do Google
        const provider = new GoogleAuthProvider();

        // Abre popup de login e aguarda resultado
        const result = await signInWithPopup(auth, provider);

        // Extrai dados do utilizador autenticado
        const userData = {
            id: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            provider: "google",
        };

        // Atualiza o estado (não guarda no localStorage, Firebase gere a sessão)
        setUser(userData);

        return result;
    };

    /**
     * Logout
     * Termina a sessão do utilizador, independentemente do método de login
     */
    const logout = async () => {
        // Limpa o localStorage (para login via MongoDB)
        localStorage.removeItem("user");

        try {
            await signOut(auth)
        } catch (error) {
            //Ignora erro se não estava logado no Firebase
        }

        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Erro ao fazer logout no servidor", error);
        }

        // Limpa o estado do utilizador
        setUser(null);

        window.location.href = "/login";
    };

   const updateProfile = (newData) => {
           setUser((prevUser) => {
               const updatedUser = { ...prevUser, ...newData };

               if(updatedUser.provider === "mongodb" || localStorage.getItem("user")) {
                   localStorage.setItem("user", JSON.stringify(updatedUser));
               }

               return updatedUser;
           }
           );
   }

    /**
     * Provider do contexto
     * Fornece o estado e funções de autenticação a toda a aplicação
     */
    return (
        <AuthContext.Provider
            value={{
                user,           // Dados do utilizador atual
                loading,        // Estado de carregamento
                login,          // Função de login (MongoDB)
                register,       // Função de registo (MongoDB)
                loginWithGoogle,// Função de login com Google
                logout,         // Função de logout
                updateProfile, // Atualizar perfil de utilizador
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
