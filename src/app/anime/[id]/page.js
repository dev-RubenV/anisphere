import Link from "next/link";
import {Star, Trophy, Users, Play, Clock, Calendar, Heart, HeartIcon} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {AddToWatchlistButton} from "@/components/AddToWatchlistButton";
import {cookies} from "next/headers";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {AddToFavoritesButton} from "@/components/AddToFavoritesButton";

export default async function AnimeDetailPage({ params }) {
    const { id } = await params;
    let userData = null;

    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const data = await response.json();
    const anime = data.data;

    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId");
    const userId = userIdCookie?.value;

    const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

    if (userId) {
        try {
            // 1. Server Components precisam de URLs absolutos (http://...)
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            // 2. Usa GET para buscar a lista (Não existe método "FIND" em HTTP)
            const res = await fetch(`${baseUrl}/api/watchlist?userId=${userId}`, {
                method: "GET",
                cache: "no-store", // Garante que obtém sempre os dados mais recentes
            });

            if (res.ok) {
                const watchlist = await res.json(); // 3. É obrigatório usar await no .json()

                // 4. Procura manualmente este anime específico na lista retornada
                userData = watchlist.find((item) => item.mal_id === anime.mal_id) || null;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    return (
        <div className="w-full pb-20 selection:bg-[#FD8D32]/30">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Secção Superior: Layout em grelha para o Poster e Informações Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">

                    {/* Coluna Esquerda: Poster e Ações Rápidas */}
                    <div className="md:col-span-1 flex flex-col gap-5">
                        <div className="relative group">
                            <img
                                src={anime.images.jpg.large_image_url}
                                alt={anime.title_english}
                                className="w-full h-auto rounded-2xl shadow-xl object-cover border border-[#E6E8EA]"
                            />
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#DCC1B1]/30" />
                        </div>

                        {/* Botões de Ação */}
                        <div className="grid grid-cols-2 gap-3">
                            {anime.trailer?.url && (
                                <Button
                                    asChild
                                    className="w-full bg-[#FD8D32] hover:bg-[#e07a28] text-white shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                                >
                                    <a href={anime.trailer.url} target="_blank" rel="noopener noreferrer">
                                        <Play className="w-4 h-4 mr-2" fill="currentColor" />
                                        Trailer
                                    </a>
                                </Button>
                            )}
                            <div className="contents">
                                <AddToWatchlistButton anime={anime} userData={userData} />
                                <AddToFavoritesButton anime={anime} userData={userData}/>
                            </div>
                        </div>

                        {/* Cartão de Informação Rápida */}
                        <div className="aura-card p-5 space-y-4 text-sm mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[#4A5568] font-medium">Episodes</span>
                                <span className="font-semibold text-[#1A202E] bg-[#EDF2F7] px-2 py-0.5 rounded-md">{anime.episodes || '?'}</span>
                            </div>
                            <Separator className="bg-[#E6E8EA]" />
                            <div className="flex justify-between items-center">
                                <span className="text-[#4A5568] font-medium">Duration</span>
                                <span className="font-semibold text-[#1A202E]">{anime.duration}</span>
                            </div>
                            <Separator className="bg-[#E6E8EA]" />
                            <div className="flex justify-between items-center">
                                <span className="text-[#4A5568] font-medium">Status</span>
                                <span className="text-[#FD8D32] font-semibold">{anime.status}</span>
                            </div>
                            <Separator className="bg-[#E6E8EA]" />
                            <div className="flex justify-between items-center">
                                <span className="text-[#4A5568] font-medium">Source</span>
                                <span className="font-semibold text-[#1A202E]">{anime.source}</span>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Direita: Detalhes do Conteúdo */}
                    <div className="md:col-span-2 lg:col-span-3 space-y-8">

                        {/* Área do Cabeçalho */}
                        <div className="space-y-5">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {anime.genres.map((genre) => (
                                        <Badge
                                            key={genre.mal_id}
                                            variant="secondary"
                                            className="bg-[#EDF2F7] hover:bg-[#DDE2F6] text-[#1A202E] font-medium border-none px-3 py-1"
                                        >
                                            {genre.name}
                                        </Badge>
                                    ))}
                                    <Badge variant="outline" className="border-[#FD8D32]/30 text-[#954A00] bg-[#FD8D32]/10 px-3 py-1 font-semibold">
                                        {anime.rating}
                                    </Badge>
                                </div>

                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A202E] mb-2 leading-tight">
                                    {anime.title_english || anime.title}
                                </h1>
                                <h2 className="text-xl text-[#4A5568] font-medium">
                                    {anime.title_japanese}
                                </h2>
                            </div>

                            {/* Linha de Estatísticas */}
                            <div className="flex flex-wrap gap-6 md:gap-10 p-5 aura-card mt-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#FD8D32]/10 rounded-xl">
                                        <Star className="w-6 h-6 text-[#FD8D32]" fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[#1A202E]">{anime.score || 'N/A'}</div>
                                        <div className="text-xs text-[#4A5568] uppercase font-bold tracking-wider mt-0.5">Score</div>
                                    </div>
                                </div>

                                <div className="w-px h-12 bg-[#E6E8EA] hidden sm:block" />

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#DDE2F6] rounded-xl">
                                        <Trophy className="w-6 h-6 text-[#585E6E]" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[#1A202E]">#{anime.rank || '?'}</div>
                                        <div className="text-xs text-[#4A5568] uppercase font-bold tracking-wider mt-0.5">Rank</div>
                                    </div>
                                </div>

                                <div className="w-px h-12 bg-[#E6E8EA] hidden sm:block" />

                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#D8E3FA] rounded-xl">
                                        <Users className="w-6 h-6 text-[#545F72]" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[#1A202E]">#{anime.popularity || '?'}</div>
                                        <div className="text-xs text-[#4A5568] uppercase font-bold tracking-wider mt-0.5">Popularity</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sinopse */}
                        <div className="aura-card p-6 md:p-8 space-y-4">
                            <h3 className="headline-md">Synopsis</h3>
                            <p className="text-[#4A5568] leading-relaxed text-[15px] md:text-base whitespace-pre-wrap">
                                {anime.synopsis || "No synopsis available."}
                            </p>
                        </div>

                        {/* Grelha de Informações Adicionais */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">

                            {/* Informações de Transmissão */}
                            <div className="aura-card p-5 space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#EDF2F7] rounded-lg shrink-0 mt-0.5">
                                        <Calendar className="w-5 h-5 text-[#4A5568]" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#1A202E] mb-1">Aired</div>
                                        <div className="text-[#4A5568] text-sm">{anime.aired?.string || 'Unknown'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#EDF2F7] rounded-lg shrink-0 mt-0.5">
                                        <Clock className="w-5 h-5 text-[#4A5568]" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[#1A202E] mb-1">Broadcast</div>
                                        <div className="text-[#4A5568] text-sm">{anime.broadcast?.string || 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Estúdios e Produtores */}
                            <div className="aura-card p-5 space-y-5">
                                <div>
                                    <div className="font-semibold text-[#1A202E] mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-[#FD8D32] rounded-full inline-block"></span>
                                        Studio
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {anime.studios?.length > 0 ? anime.studios.map(studio => (
                                            <Link
                                                key={studio.mal_id}
                                                href={studio.url}
                                                className="text-[#954A00] font-medium hover:text-[#FD8D32] transition-colors bg-[#FD8D32]/10 px-3 py-1 rounded-md text-sm"
                                            >
                                                {studio.name}
                                            </Link>
                                        )) : <span className="text-[#4A5568] text-sm">Unknown</span>}
                                    </div>
                                </div>
                                <Separator className="bg-[#E6E8EA]" />
                                <div>
                                    <div className="font-semibold text-[#1A202E] mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-[#545F72] rounded-full inline-block"></span>
                                        Producers
                                    </div>
                                    <p className="text-[#4A5568] text-sm leading-relaxed">
                                        {anime.producers?.length > 0 ? anime.producers.map(p => p.name).join(", ") : "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}