"use client";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {ExternalLink, Sparkles, Star, Tv} from "lucide-react";
import Link from "next/link";
import {getAnimeDetails} from "@/lib/fetchAnime";

export default function UserCard({animeData, username, photoURL, joinedAt}) {

    const watchingCount = animeData.filter(anime => anime.status === "Watching").length;
    const completedCount = animeData.filter(anime => anime.status === "Completed").length;
    const planningCount = animeData.filter(anime => anime.status === "Plan to watch").length;
    const droppedCount = animeData.filter(anime => anime.status === "Dropped").length;
    const totalAnime = animeData.length;

    const formatJoinedDate = (dateString) => {
        if(!dateString) {
            return "Unknown Date";
        }

        const date = new Date(dateString);

        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }

    const top3Favorites = animeData.filter(anime => anime.isFavorite === true).sort((a, b) => {
            const notaA = Number(a.user_score) || 0;
            const notaB = Number(b.user_score) || 0;

            return notaB - notaA;
        }).slice(0, 3);

    const favoriteAnime = top3Favorites[0];
    const [favoriteAnimeDetails, setFavoriteAnimeDetails] = useState(favoriteAnime);

    useEffect(() => {
        const fetchFavoriteAnime = async () => {

            if (!favoriteAnime?.mal_id) return;

            try {
                const data = await getAnimeDetails(favoriteAnime.mal_id);

                setFavoriteAnimeDetails(data);

            } catch (error) {
                console.error("Failed to fetch anime details from API:", error);
            }
        }

        fetchFavoriteAnime();

    }, [favoriteAnime?.mal_id]);

    console.log(favoriteAnimeDetails)

    const backgroundFallback = favoriteAnimeDetails?.images?.webp?.large_image_url || favoriteAnimeDetails?.images?.jpg?.large_image_url || favoriteAnime?.image_url;
    const hasVideo = favoriteAnimeDetails?.trailer?.embed_url;
    const youtubeId = favoriteAnimeDetails?.trailer?.youtube_id || favoriteAnimeDetails?.trailer?.embed_url?.split('/embed/')?.[1]?.split('?')?.[0];

    const videoUrl = hasVideo ? `${favoriteAnimeDetails.trailer.embed_url}&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeId}` : null;

    return (
        <div className="relative w-full mx-auto overflow-hidden rounded-2xl bg-[#eaeaea] shadow-sm border mb-8 border-primary p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
            {/* Background Layer */}
            {top3Favorites.length > 0 ? (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {hasVideo ? (
                        <iframe
                            src={videoUrl}
                            className="absolute top-1/2 left-1/2 w-[600%] h-[600%] sm:w-[400%] sm:h-[400%] md:w-[300%] md:h-[300%] -translate-x-1/2 -translate-y-1/2 opacity-100 object-cover"
                            allow="autoplay; encrypted-media"
                        />
                    ) : backgroundFallback ? (
                        <Image
                            src={backgroundFallback}
                            alt="Background"
                            fill
                            className="object-cover opacity-30"
                        />
                    ) : null}
                    {/* Light Overlay to ensure text readability */}
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-white z-0" />
            )}

            {/* Content Layer - Left User Avatar */}
            <div className="relative z-10 flex-shrink-0 flex flex-col items-center text-center">
                <Image
                    src={photoURL || "/default-avatar.png"}
                    alt={username || "User"}
                    width={140}
                    height={140}
                    className="rounded-full aspect-square object-cover shadow-sm border-[4px] border-white mb-2"
                />
                <h1 className="text-[28px] leading-tight font-medium text-gray-900 mb-1">{username}</h1>
                <div className="text-[13px] text-gray-600 mb-2 md:mb-0 font-medium flex items-center justify-center gap-1">
                    <span className="font-bold text-gray-800">User since:</span> {formatJoinedDate(joinedAt)}
                </div>
            </div>

            {/* Content Layer - Middle (Info & Stats) */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[14px] font-semibold text-gray-700">
                    <div className="flex flex-col items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-[#ff8c38] shadow-sm"></span>
                        <span>Total Anime: {totalAnime}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-[#4688ff] shadow-sm"></span>
                        <span>Watching: {watchingCount}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-[#1db954] shadow-sm"></span>
                        <span>Completed: {completedCount}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-[#a364ff] shadow-sm"></span>
                        <span>Planning: {planningCount}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="w-5 h-5 rounded-full bg-[#8e8e8e] shadow-sm"></span>
                        <span>Dropped: {droppedCount}</span>
                    </div>
                </div>
            </div>

            {/* Content Layer - Right (Top 3 Favorites) */}
            {top3Favorites.length > 0 && (
                <div className="relative z-10 flex flex-col items-center justify-center pt-2">
                    <div className="flex -space-x-5 mb-3">
                        {top3Favorites.map((anime, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-full border-[3px] border-white shadow-md" style={{ zIndex: 3 - i }}>
                                <Image
                                    src={anime.image_url}
                                    alt={anime.title}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                    <span className="text-[15px] text-gray-800 font-medium bg-white/50 px-3 py-1 rounded-full backdrop-blur-[2px]">
                        Top {top3Favorites.length} favorites
                    </span>
                </div>
            )}
        </div>
    );
}