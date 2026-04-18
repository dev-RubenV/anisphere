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

    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const data = await response.json();
    const anime = data.data;

    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get("userId");
    const userId = userIdCookie?.value;


    const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);

    if (userId) {
        try {
            // 1. Server Components need absolute URLs (http://...)
            // You cannot use relative paths like "/api/..." on the server side
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            // 2. Use GET to fetch the list (There is no "FIND" method in HTTP)
            const res = await fetch(`${baseUrl}/api/watchlist?userId=${userId}`, {
                method: "GET",
                cache: "no-store", // Ensures you always get the latest data
            });

            if (res.ok) {
                const watchlist = await res.json(); // 3. You must await .json()

                // 4. Manually find this specific anime in the returned list
                userData = watchlist.find((item) => item.mal_id === anime.mal_id) || null;
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    return (
        <div className="min-h-screen p-6 md:p-10 font-sans selection:bg-indigo-500/30">
            <div className="max-w-6xl mx-auto">
                {/* Top Section: Grid Layout for Poster and Main Info */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column: Poster & Quick Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="relative group">
                            <img
                                src={anime.images.jpg.large_image_url}
                                alt={anime.title_english}
                                className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-zinc-800 object-cover"
                            />
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {anime.trailer?.url && (
                                <Button
                                    asChild
                                    className="w-full bg-slate-800/50 hover:bg-indigo-700 text-white"
                                >
                                    <a href={anime.trailer.url} target="_blank" rel="noopener noreferrer">
                                        <Play className="w-4 h-4 mr-2" fill="currentColor" />
                                        Watch Trailer
                                    </a>
                                </Button>
                            )}
                            <AddToWatchlistButton anime={anime} userData={userData} />
                            <AddToFavoritesButton anime={anime} userData={userData}/>
                        </div>

                        {/* Quick Information Card */}
                        <Card className="bg-slate-800/50">
                            <CardContent className="p-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Episodes</span>
                                    <span className="font-medium">{anime.episodes}</span>
                                </div>
                                <Separator className="bg-slate-700" />
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Duration</span>
                                    <span className="font-medium">{anime.duration}</span>
                                </div>
                                <Separator className="bg-slate-700" />
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Status</span>
                                    <span className="text-emerald-400 font-medium">{anime.status}</span>
                                </div>
                                <Separator className="bg-slate-700" />
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Source</span>
                                    <span className="font-medium">{anime.source}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Content Details */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Header Area */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {anime.genres.map((genre) => (
                                        <Badge
                                            key={genre.mal_id}
                                            variant="secondary"
                                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                                        >
                                            {genre.name}
                                        </Badge>
                                    ))}
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                                        {anime.rating}
                                    </Badge>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                                    {anime.title_english || anime.title}
                                </h1>
                                <h2 className="text-xl text-zinc-500 font-medium">
                                    {anime.title_japanese}
                                </h2>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-6 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-full">
                                        <Star className="w-6 h-6 text-amber-500" fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{anime.score}</div>
                                        <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Score</div>
                                    </div>
                                </div>

                                <div className="w-px h-12 bg-slate-700 hidden sm:block" />

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-full">
                                        <Trophy className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">#{anime.rank}</div>
                                        <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Rank</div>
                                    </div>
                                </div>

                                <div className="w-px h-12 bg-slate-700 hidden sm:block" />

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-full">
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">#{anime.popularity}</div>
                                        <div className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Popularity</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Synopsis */}
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-zinc-200">Synopsis</h3>
                            <p className="text-zinc-400 leading-relaxed text-lg whitespace-pre-wrap">
                                {anime.synopsis}
                            </p>
                        </div>

                        {/* Additional Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800">

                            {/* Broadcast Info */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <div className="font-semibold text-zinc-200">Aired</div>
                                        <div className="text-zinc-400">{anime.aired.string}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-zinc-500 mt-1" />
                                    <div>
                                        <div className="font-semibold text-zinc-200">Broadcast</div>
                                        <div className="text-zinc-400">{anime.broadcast.string}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Studios & Producers */}
                            <div className="space-y-4">
                                <div>
                                    <div className="font-semibold text-zinc-200 mb-1">Studio</div>
                                    <div className="flex flex-wrap gap-2">
                                        {anime.studios.map(studio => (
                                            <Link
                                                key={studio.mal_id}
                                                href={studio.url}
                                                className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                {studio.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold text-zinc-200 mb-1">Producers</div>
                                    <p className="text-zinc-400 text-sm">
                                        {anime.producers.map(p => p.name).join(", ")}
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