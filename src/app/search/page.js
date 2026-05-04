import Link from "next/link";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import {AddToWatchlistButton} from "@/components/AddToWatchlistButton";
import {AddToFavoritesButton} from "@/components/AddToFavoritesButton";
import clientPromise from "@/lib/mongodb";
import { headers, cookies } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { escapeRegExp } from "@/lib/utils";
import * as React from "react";

export default async function AnimeSearchPage({ searchParams }) {


    const { q } = await searchParams;

    if(!q) return <div className="p-8 text-center text-[#4A5568]">Please Enter a Search Term</div>

    const client = await clientPromise;
    const db = client.db("anisphere");
    const usersCollection = await db.collection("users");

    const [animeResponse, usersResult] = await Promise.all([
        fetch(`https://api.jikan.moe/v4/anime?q=${q}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }),

        usersCollection.find({
            displayName: {
                $regex: escapeRegExp(q),
                $options: "i"}
        }).project({
            displayName: 1,
            photoURL: 1,
            _id: 0
        }).toArray()
    ]);

    const animeData = await animeResponse.json();
    const animeResults = animeData.data || [];

    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId");
    const userId = userIdCookie?.value;

    let watchlistMap = {};
    if (userId) {
        try {

            // Pega apenas os IDs dos animes da pesquisa atual
            const animeIds = animeResults.map(a => a.mal_id);

            // Busca eficiente: Apenas animes desta página que o user tem
            const foundEntries = await db.collection("watchlist").find({
                userId: userId,
                mal_id: { $in: animeIds }
            }).toArray();

            // Mapear para acesso rápido
            foundEntries.forEach(entry => {
                watchlistMap[entry.mal_id] = {
                    ...entry,
                    _id: entry._id.toString(),
                    updatedAt: entry.updatedAt?.toString(),
                    createdAt: entry.createdAt?.toString()
                };
            });
        } catch (e) {
            console.error("Erro BD", e);
        }
    }

    if (!animeResponse.ok) {
        return <div className="p-8 text-center text-[#BA1A1A] font-semibold">Error fetching data</div>;
    }

    return (
        <div className="flex flex-col gap-10 w-full pb-20">

            {/* --- SECÇÃO DE UTILIZADORES --- */}
                {usersResult.length === 0 ? null :
                 (
                 <section>
                    <h2 className="headline-md mb-4 text-[#1A202E]">Users</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {usersResult.map((user, index) => (
                            <Link href={`/user/${user.displayName}`} key={index} className="aura-card flex flex-col items-center justify-center p-5 hover:-translate-y-1 hover:shadow-md transition-all gap-3 border-[#E6E8EA]">
                                {/* Liga isto à página de perfil do utilizador! */}
                                    <Avatar className="w-16 h-16 ring-2 ring-[#FD8D32]/10 ring-offset-2">
                                        <AvatarImage
                                            src={user?.photoURL}
                                            alt="user"
                                            referrerPolicy="no-referrer"
                                        />
                                        <AvatarFallback className="bg-[#FD8D32]/10 text-[#954A00] font-bold text-xl">
                                            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-[#1A202E] text-center line-clamp-1 w-full">{user.displayName}</span>
                            </Link>
                        ))}
                    </div>
                </section>
                )}

            {/* --- SECÇÃO DE ANIME --- */}
            <section>
                <h2 className="headline-md mb-4 text-[#1A202E]">Anime</h2>
                {animeResults.length === 0 ? (
                    <div className="aura-card p-10 text-center">
                        <p className="text-[#4A5568]">No anime found for &quot;<span className="font-semibold text-[#1A202E]">{q}</span>&quot;.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {animeResults.filter((anime, index, self) =>
                            index === self.findIndex((a) => a.mal_id === anime.mal_id)
                        ).map((anime) => {
                            const existingEntry = watchlistMap[anime.mal_id] || null;

                            return (
                                <div
                                    key={anime.mal_id}
                                    className="aura-card hover:bg-[#EDF2F7]/50 transition-colors flex flex-col sm:flex-row overflow-hidden border-[#E6E8EA]"
                                >
                                    <Link href={`/anime/${anime.mal_id}`} className="flex-1 flex flex-row p-3 gap-4 hover:opacity-90">
                                        <div className="shrink-0">
                                            <Image
                                                src={anime.images.jpg.image_url}
                                                alt={anime.title}
                                                width={90}
                                                height={125}
                                                className="rounded-lg object-cover h-[125px] w-[90px] shadow-sm"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center py-2 pr-2">
                                            <h3 className="font-bold text-[#1A202E] text-base sm:text-lg line-clamp-2 leading-tight mb-1">
                                                {anime.title_english || anime.title}
                                            </h3>
                                            <p className="text-sm font-medium text-[#4A5568] mb-1">
                                                <span className="bg-[#EDF2F7] px-2 py-0.5 rounded-md text-[#1A202E] text-xs mr-2">{anime.type}</span>
                                                {anime.episodes ? `${anime.episodes} episodes` : 'Unknown eps'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-auto">
                                                <Star className="w-3.5 h-3.5 text-[#FD8D32]" fill="currentColor" />
                                                <span className="text-sm font-semibold text-[#1A202E]">{anime.score || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex flex-row sm:flex-col items-center justify-end sm:justify-center gap-2 p-3 sm:p-4 bg-[#F8FAFC] sm:bg-transparent border-t sm:border-t-0 sm:border-l border-[#E6E8EA] sm:min-w-[140px]">
                                        <div className="w-full max-w-[120px] sm:max-w-full">
                                            <AddToWatchlistButton anime={anime} userData={existingEntry}/>
                                        </div>
                                        <div className="w-full max-w-[120px] sm:max-w-full">
                                            <AddToFavoritesButton anime={anime} userData={existingEntry}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}