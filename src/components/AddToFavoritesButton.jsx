'use client'
import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AddToFavoritesButton({ anime, userData }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setIsFavorite(userData?.isFavorite || false);
    }, [userData]);

    const handleToggleFavorite = async () => {
        if (!user) {
            router.push("/login");
            return;
        }

        const newFavoriteState = !isFavorite;
        
        // Atualização otimista da UI
        setIsFavorite(newFavoriteState);

        try {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    anime: anime,
                    userId: user.id || user._id,
                    username: user.displayName,
                    user_score: userData?.user_score || 0.0,
                    status: userData?.status || "Watching",
                    image_url: userData?.image_url || anime.images?.jpg?.image_url || "",
                    progress: userData?.progress || 0,
                    isFavorite: newFavoriteState,
                    notes: userData?.notes || ""
                })
            });

            if (res.ok) {
                toast(newFavoriteState ? "Added to favorites!" : "Removed from favorites!");
                router.refresh();
            } else {
                // Reverter atualização otimista
                setIsFavorite(!newFavoriteState);
                toast.error("Failed to update favorites");
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            // Reverter atualização otimista
            setIsFavorite(!newFavoriteState);
            toast.error("An error occurred");
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={handleToggleFavorite}
                    variant="outline"
                    className={`cursor-pointer w-full transition-all border-[#DCC1B1] shadow-sm
                        ${isFavorite 
                            ? "bg-[#FD8D32]/10 hover:bg-[#FD8D32]/20 border-[#FD8D32]/30 text-[#954A00]" 
                            : "bg-white hover:bg-[#F8FAFC] text-[#4A5568] hover:text-[#1A202E]"
                        }`}
                >
                    <HeartIcon className={`w-4 h-4 mr-2 ${isFavorite ? "fill-[#FD8D32] text-[#FD8D32]" : ""}`} />
                    {isFavorite ? "Favorited" : "Favorite"}
                </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-white border-[#DCC1B1] text-[#1A202E]">
                <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
            </TooltipContent>
        </Tooltip>
    );
}