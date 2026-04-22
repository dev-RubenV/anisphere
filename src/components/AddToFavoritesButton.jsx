'use client'
import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, PencilIcon, HeartIcon, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Toggle } from "@/components/ui/toggle"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {toast} from "sonner";


export function AddToFavoritesButton({ anime, userData}) {
    const { user } = useAuth();
    const router = useRouter();
    const [isAdded, setIsAdded] = useState(!!userData);

    const [status, setStatus] = useState(userData?.status || 'Watching');
    const [score, setScore] = useState(userData?.user_score || 0.0);
    const [progress, setProgress] = useState(userData?.progress ||0);
    const [image_url, setImageURL] = useState(userData?.image_url || "");
    const [isFavorite, setIsFavorite] = useState(userData?.isFavorite || false);
    const [notes, setNotes] = useState(userData?.notes || '');

    const handleIsFavorite = async (pressed) => {

        const newIsFavorite = !isFavorite;
        setIsFavorite(newIsFavorite);

        if (!user) {
            router.push("/login");
            return;
        }

        try {

            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    anime: anime,
                    userId: user.id || user._id,
                    username: user.displayName,
                    user_score: score,
                    status: status,
                    image_url: image_url,
                    progress: progress,
                    isFavorite: newIsFavorite,
                    notes: notes
                })
            });

            if (res.ok) {
                setIsAdded(true);
                router.refresh();

                toast(isFavorite ? `${anime.title_english} has been removed from your favorites` : `${anime.title_english} has been added to your favorites`);
            }
            else{
                setIsFavorite(!newIsFavorite);
                console.error("Failed to update favorite");
            }
        } catch (error) {
            console.error("Failed to add", error);
        }
    };

    if(user) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        onPressedChange={handleIsFavorite}
                        pressed={isFavorite}
                        aria-label="Toggle favorite"
                        size="sm"
                        variant="outline"
                        className="cursor-pointer py-4.25 w-full bg-red-400 text-white hover:bg-red-500 data-[state=on]:*:[svg]:fill-neutral-0 data-[state=on]:*:[svg]:fill-neutral-0"
                    >
                        <HeartIcon className={`transition-all ${isFavorite ? "fill-current" : ""}`} />                    </Toggle>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>{!isFavorite ? "Add to":"Remove from"} favorites</p>
                </TooltipContent>
            </Tooltip>
        );
    } return (
        <Link href="/login">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Toggle
                        onPressedChange={handleIsFavorite}
                        pressed={isFavorite}
                        aria-label="Toggle favorite"
                        size="sm"
                        className="cursor-pointer py-4.25 w-full data-[state=on]:*:[svg]:fill-blue-400 data-[state=on]:*:[svg]:stroke-blue-400"
                    >
                        <HeartIcon className={`transition-all ${isFavorite ? "fill-current" : ""}`} />
                    </Toggle>
                </TooltipTrigger>
                 <TooltipContent side="bottom">
                    <p>{isAdded ? "Add to":"Remove from"} favorites</p>
                </TooltipContent>
            </Tooltip>
        </Link>
    );


}