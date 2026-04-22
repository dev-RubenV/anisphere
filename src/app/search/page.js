import Link from "next/link";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
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
import * as React from "react";

export default async function AnimeSearchPage({ searchParams }) {


    const { q } = await searchParams;

    if(!q) return <div className="p-4">Please Enter a Search Term</div>

    const client = await clientPromise;
    const db = client.db("anilog");
    const usersCollection = await db.collection("users");

    const [animeResponse, usersResult] = await Promise.all([
        fetch(`https://api.jikan.moe/v4/anime?q=${q}`),

        usersCollection.find({
            displayName: {
                $regex: q,
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
        return <div>Error fetching data</div>;
    }

    return (
        <div className="flex flex-col gap-8">

            {/* --- USERS SECTION --- */}
                {usersResult.length === 0 ? null :
                 (
                 <section>
                    <h2 className="text-2xl font-bold mb-4">Users</h2>
                    <div className="grid grid-cols-5 gap-2">
                        {usersResult.map((user, index) => (
                            <Link href={`/user/${user.displayName}`} key={index} className="flex flex-col items-center min-w-48 p-4 border rounded-md hover:bg-accent transition-colors font-bold">
                                {/* Link this to your user profile page later! */}
                                    <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                                        <AvatarImage
                                            src={user?.photoURL}
                                            alt="user"
                                            referrerPolicy="no-referrer"
                                        />
                                        <AvatarFallback>
                                            {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.displayName}
                            </Link>
                        ))}
                    </div>
                </section>
                )}

            {/* --- ANIME SECTION --- */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Anime</h2>
                {animeResults.length === 0 ? (
                    <p className="text-muted-foreground">No anime found for &quot;{q}&quot;.</p>
                ) : (
                    <ItemGroup className="gap-4">
                        {animeResults.map((anime) => {
                            const existingEntry = watchlistMap[anime.mal_id] || null;

                            return (
                                <Item
                                    key={anime.mal_id}
                                    variant="outline"
                                    role="listitem"
                                    className="hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <Link href={`/anime/${anime.mal_id}`} className="flex-1 flex gap-4">
                                        <ItemMedia>
                                            <Image
                                                src={anime.images.jpg.image_url}
                                                alt={anime.title}
                                                width={125}
                                                height={218}
                                                className="rounded-xl"
                                                unoptimized
                                            />
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle className="line-clamp-1">
                                                {anime.title_english || anime.title}
                                            </ItemTitle>
                                            <ItemDescription>{anime.type} ({anime.episodes} episodes)</ItemDescription>
                                            <ItemDescription>Average score: {anime.score}</ItemDescription>
                                        </ItemContent>
                                    </Link>

                                    <ItemContent className="flex-none text-center gap-2 flex items-center">
                                        <AddToWatchlistButton anime={anime} userData={existingEntry}/>
                                        <AddToFavoritesButton anime={anime} userData={existingEntry}/>
                                    </ItemContent>
                                </Item>
                            );
                        })}
                    </ItemGroup>
                )}
            </section>
        </div>
    );
}