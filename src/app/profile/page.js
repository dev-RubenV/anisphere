'use client'
import * as React from "react"
import { useAuth } from "@/context/AuthContext";
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";

export default function Profile() {
    const router = useRouter();
    // Vamos buscar apenas o que precisamos ao contexto
    const { user, loading: authLoading, updateProfile } = useAuth();

    // Redireciona se não estiver logado
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const handleIsPublic = async (pressed) => {
        // 1. Atualização Otimista: Mudamos logo no Contexto para a UI reagir instantaneamente
        updateProfile({ isPublic: pressed });

        try {
            const response = await fetch(`/api/users/watchlist-visibility/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isPublic: pressed,
                })
            });

            if (response.ok) {
                router.refresh();
                toast(pressed ? `Your list has been set to public!` : `Your list has been set to private!`);
            } else {
                console.error("Failed to set list to " + (isPublic ? "private":"public"));
            }
        } catch(error) {
            // 2. Reversão: Se a API der erro, voltamos a colocar no Contexto o valor que estava antes
            updateProfile({ isPublic: !pressed });
            toast("Error: Failed to update list visibility");
            console.error("Failed to set list visibility", error);
        }
    }

    // Enquanto carrega ou se o utilizador não existir, não renderiza o botão
    if (authLoading || !user) {
        return <div>A carregar definições...</div>;
    }

    // Assumimos 'true' caso o isPublic ainda não exista na base de dados
    const isPublic = user.isPublic ?? true;

    return (
        <div>
            <p className="flex items-center gap-3">Set watchlist to
                <Toggle
                    className="cursor-pointer"
                    pressed={isPublic}
                    onPressedChange={handleIsPublic}
                    aria-label="Toggle visibility"
                    size="sm"
                    variant="outline"
                >
                    {!isPublic ? <EyeIcon/> : <EyeOffIcon/>}
                    {!isPublic ? "Public" : "Private"}
                </Toggle>
            </p>
        </div>
    )
}