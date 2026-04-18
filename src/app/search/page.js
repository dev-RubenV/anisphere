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

export default async function AnimeSearchPage({ searchParams }) {


    const { q } = await searchParams;
    const animeResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${q}`);
    const animeData = await animeResponse.json();
    const animeResults = animeData.data || [];

    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId");
    const userId = userIdCookie?.value;

    let watchlistMap = {};
    if (userId) {
        try {
            const client = await clientPromise;
            const db = client.db("anilog");

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
        <div>
            <ItemGroup className="gap-4">
                {animeResults.map((anime) => {
                    // Verifica se existe no mapa
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
        </div>
    );
}