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
                console.error("Failed to set list to " + (pressed ? "public" : "private"));
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
        return (
            <div className="flex items-center justify-center py-20 w-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#FD8D32]/30 border-t-[#FD8D32] rounded-full animate-spin"></div>
                    <p className="text-[#4A5568] text-sm">Loading settings...</p>
                </div>
            </div>
        );
    }

    // Assumimos 'true' caso o isPublic ainda não exista na base de dados
    const isPublic = user.isPublic ?? true;

    return (
        <div className="flex flex-col items-center justify-center w-full mt-10">
            <div className="aura-card p-8 w-full max-w-lg space-y-6">
                <div className="text-center">
                    <h1 className="headline-md text-[#1A202E]">Profile Visibility</h1>
                    <p className="text-[#4A5568] text-sm mt-2">Control who can see your anime tracking list.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E6E8EA] gap-4">
                    <div className="text-center sm:text-left">
                        <p className="font-semibold text-[#1A202E] text-base">Watchlist Privacy</p>
                        <p className="text-[#4A5568] text-xs">Currently: <strong className={isPublic ? "text-[#954A00]" : "text-[#BA1A1A]"}>{isPublic ? "Public" : "Private"}</strong></p>
                    </div>
                    
                    <Toggle
                        className="cursor-pointer data-[state=on]:bg-[#FD8D32] data-[state=on]:text-white data-[state=off]:bg-[#EDF2F7] data-[state=off]:text-[#4A5568] transition-colors border-none py-2 px-4 rounded-lg w-full sm:w-auto"
                        pressed={isPublic}
                        onPressedChange={handleIsPublic}
                        aria-label="Toggle visibility"
                        size="lg"
                        variant="outline"
                    >
                        {!isPublic ? <EyeOffIcon className="mr-2 w-4 h-4" /> : <EyeIcon className="mr-2 w-4 h-4" />}
                        {isPublic ? "Set to Private" : "Set to Public"}
                    </Toggle>
                </div>
            </div>
        </div>
    )
}