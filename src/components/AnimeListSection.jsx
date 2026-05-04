import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MessageSquareText } from 'lucide-react';
import { AddToWatchlistButton } from "@/components/AddToWatchlistButton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AnimeListSection({ icon, title, animeList, showScore = true, showProgress = true, iconOnly = false }) {
    const [sortBy, setSortBy] = useState(showScore ? 'score' : 'default');

    const sortedList = [...animeList].sort((a, b) => {
        if (sortBy === 'score') {
            const scoreA = a.user_score || 0;
            const scoreB = b.user_score || 0;
            return scoreB - scoreA; // Descendente
        } else if (sortBy === 'episodes') {
            const epA = a.episodes || 0;
            const epB = b.episodes || 0;
            return epB - epA; // Descendente
        } else if (sortBy === 'progress') {
            const progA = a.progress || 0;
            const progB = b.progress || 0;
            return progB - progA; // Descendente
        }
        return 0; // Padrão (Ordem de Adição)
    });

    return (
        <section className="w-full mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3">
                <h2 className="headline-md flex gap-2 items-center">{icon}{title}</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[#4A5568] font-medium">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[140px] bg-white">
                            <SelectValue placeholder={showScore ? "Score" : "Order Added"} />
                        </SelectTrigger>
                        <SelectContent>
                            {showScore ? (
                                <SelectItem value="score">Score</SelectItem>
                            ) : (
                                <SelectItem value="default">Order Added</SelectItem>
                            )}
                            {showProgress && <SelectItem value="progress">Progress</SelectItem>}
                            <SelectItem value="episodes">Total Episodes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="aura-card overflow-hidden">
                {/* Vista de tabela para desktop */}
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
                            {sortedList.map((anime) => (
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
                                                <AddToWatchlistButton anime={anime} userData={anime} iconOnly={iconOnly} />
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
                                            {title === "Completed" ? anime.episodes : `${anime.progress}/${anime.episodes || '?'}`}
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

                {/* Vista de cartões para mobile */}
                <div className="md:hidden divide-y divide-[#F2F4F6]">
                    {sortedList.map((anime) => (
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
                                    <AddToWatchlistButton anime={anime} userData={anime} iconOnly={iconOnly} />
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
                                            {title === "Completed" ? `${anime.episodes} eps` : `${anime.progress}/${anime.episodes || '?'}`}
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

                {sortedList.length === 0 && (
                    <div className="py-8 text-center text-[#4A5568] text-sm">
                        No anime in this category yet.
                    </div>
                )}
            </div>
        </section>
    );
}
