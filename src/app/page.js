'use client'
import * as React from "react"
import Image from "next/image"
import Link from "next/link";
import { CirclePlay, Play, CircleX, CircleCheck, Bookmark } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

import {MessageSquareText} from 'lucide-react';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AddToWatchlistButton } from "@/components/AddToWatchlistButton";
import {SuggestAI} from "@/components/SuggestAI";

export default function Home() {
    const [watchlist, setWatchlist] = useState([]);
    const watching = watchlist.filter((anime) => anime.status === "Watching");
    const completed = watchlist.filter((anime) => anime.status === "Completed");
    const planToWatch = watchlist.filter((anime) => anime.status === "Plan to watch");
    const dropped = watchlist.filter((anime) => anime.status === "Dropped");
    const [isLoading, setIsLoading] = useState(true);

    const { user, loading} = useAuth();

    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!user) return;

            try{
                const res = await fetch(`/api/watchlist?userId=${user.id || user._id}`)
                const data = await res.json();
                setWatchlist(data);
            }
            catch (error) {console.error("Failed to fetch watchlist")}
            finally{
                setIsLoading(false);
            }
        };
        fetchWatchlist();
    }, [user]);

    if(!user) return null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 w-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#FD8D32]/30 border-t-[#FD8D32] rounded-full animate-spin"></div>
                    <p className="text-[#4A5568] text-sm">Loading your anime list...</p>
                </div>
            </div>
        );
    }

    const renderSection = (icon, title, animeList, showScore = true, showProgress = true) => (
        <section className="w-full mb-10">
            <h2 className="headline-md pb-3 flex gap-2 items-center">{icon}{title}</h2>
            <div className="aura-card overflow-hidden">
                {/* Desktop table view */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[#E6E8EA] hover:bg-transparent">
                                <TableHead className="w-16"></TableHead>
                                <TableHead className="font-semibold text-[#1A202E]">Title</TableHead>
                                <TableHead className="w-5"></TableHead>
                                {showScore && <TableHead className="font-semibold text-[#1A202E] text-center w-20">Score</TableHead>}
                                {showProgress && <TableHead className="font-semibold text-[#1A202E] text-center w-24">Progress</TableHead>}
                                <TableHead className="font-semibold text-[#1A202E] text-center w-20">Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {animeList.map((anime) => (
                                <TableRow key={anime.mal_id} className="border-b border-[#F2F4F6] hover:bg-[#EDF2F7] transition-colors">
                                    <TableCell className="py-3">
                                        <div className="relative group w-11 h-11 mx-auto">
                                            <Image
                                                src={anime.image_url}
                                                alt={anime.title}
                                                width={44}
                                                height={44}
                                                className="rounded-lg aspect-square object-cover group-hover:brightness-75 transition-all duration-300"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <AddToWatchlistButton anime={anime} userData={anime} iconOnly={true} />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link className="cursor-pointer block text-[#1A202E] hover:text-[#FD8D32] font-medium transition-colors text-sm" href={`/anime/${anime.mal_id}`}>
                                            {anime.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {anime.notes && (
                                            <HoverCard>
                                                <HoverCardTrigger>
                                                    <MessageSquareText size={14} className="text-[#897365]" strokeWidth={1.5} />
                                                </HoverCardTrigger>
                                                <HoverCardContent className="bg-white border-[#DCC1B1]/30 shadow-lg text-[#1A202E] text-sm">
                                                    {anime.notes}
                                                </HoverCardContent>
                                            </HoverCard>
                                        )}
                                    </TableCell>
                                    {showScore && <TableCell className="text-center text-[#4A5568] text-sm">{anime.user_score}</TableCell>}
                                    {showProgress && (
                                        <TableCell className="text-center text-[#4A5568] text-sm">
                                            {title === "Completed" ? anime.episodes : `${anime.progress}/${anime.episodes}`}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#EDF2F7] text-[#4A5568] text-xs font-medium">
                                            {anime.type}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile card view */}
                <div className="md:hidden divide-y divide-[#F2F4F6]">
                    {animeList.map((anime) => (
                        <div key={anime.mal_id} className="flex items-center gap-3 p-3 hover:bg-[#EDF2F7] transition-colors">
                            <div className="relative group shrink-0">
                                <Image
                                    src={anime.image_url}
                                    alt={anime.title}
                                    width={48}
                                    height={48}
                                    className="rounded-lg aspect-square object-cover w-12 h-12"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <AddToWatchlistButton anime={anime} userData={anime} iconOnly={true} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/anime/${anime.mal_id}`} className="text-sm font-medium text-[#1A202E] hover:text-[#FD8D32] transition-colors line-clamp-1">
                                    {anime.title}
                                </Link>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-[#4A5568]">{anime.type}</span>
                                    {showScore && <span className="text-xs text-[#4A5568]">Score: {anime.user_score}</span>}
                                    {showProgress && (
                                        <span className="text-xs text-[#4A5568]">
                                            {title === "Completed" ? `${anime.episodes} eps` : `${anime.progress}/${anime.episodes}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {anime.notes && (
                                <MessageSquareText size={14} className="text-[#897365] shrink-0" strokeWidth={1.5} />
                            )}
                        </div>
                    ))}
                </div>

                {animeList.length === 0 && (
                    <div className="py-8 text-center text-[#4A5568] text-sm">
                        No anime in this category yet.
                    </div>
                )}
            </div>
        </section>
    );

  return (
      <div className="w-full space-y-2">
          {renderSection(<Play className="fill-primary"/>, "Watching", watching, true, true)}
          {renderSection(<CircleCheck className="fill-primary"/>,"Completed", completed, true, true)}
          {renderSection(<Bookmark className="fill-primary"/>,"Plan to Watch", planToWatch, false, false)}
          {renderSection(<CircleX className="fill-primary"/>,"Dropped", dropped, true, true)}
          <SuggestAI />
      </div>
  );
}
