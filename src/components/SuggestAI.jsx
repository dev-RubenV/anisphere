import {useRouter} from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import { BotMessageSquare, Loader2 } from "lucide-react";
import {NextResponse} from "next/server";
import { GoogleGenAI } from "@google/genai";
import {useState} from "react";


export function SuggestAI({ animeData }) {
    const { user } = useAuth();
    const router = useRouter();

    // Add state to handle the loading UI and the final result
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        setIsLoading(true);

        try {
            // Fetch the user's current list
            const listRes = await fetch(`/api/watchlist?userId=${user.id || user._id}`);
            const currentUserAnimeData = await listRes.json();

            // Ask backend API to talk to Gemini
            const aiRes = await fetch("/api/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentUserAnimeData,
                    animeData,
                    displayName: user.displayName
                })
            });

            if (!aiRes.ok) throw new Error("API request failed");

            const recommendationData = await aiRes.json();

            console.log("Success! Here is the data:", recommendationData);
            setSuggestion(recommendationData);

        } catch (error) {
            console.error("Failed to get suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="cursor-pointer text-white transition-all bg-blue-400 hover:bg-blue-500 w-fit"
            >
                {isLoading ? "Thinking..." : "Ask AI suggestion"}
                {isLoading ? <Loader2 className="animate-spin ml-2" /> : <BotMessageSquare className="ml-2" />}
            </Button>

            {/* Render the suggestions once they arrive! */}
            {suggestion && (
                <div className="bg-slate-800 p-4 rounded-lg mt-4">
                    <p className="text-blue-300 font-bold mb-2">{suggestion.message}</p>
                    <ul className="flex flex-col gap-2">
                        {suggestion.suggestions.map((anime) => (
                            <li key={anime.mal_id} className="bg-slate-700 p-3 rounded">
                                <span className="font-bold">{anime.title}</span>: {anime.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}