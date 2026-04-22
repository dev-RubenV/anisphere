'use client'
import * as React from "react"
import Image from "next/image"
import Link from "next/link";
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
    // const [status, setStatus] = useState(false);
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
        return <div>Loading your anime list...</div>;
    }

  return (
      <div className="userlist w-full">
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 w-full ">
              Watching
          </h2>
          <div className="flex flex-col gap-6 mb-32 bg-slate-800/50 rounded-lg p-8">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-20"></TableHead>
                          <TableHead  className="font-bold">Title</TableHead>
                          <TableHead className="w-5"></TableHead>
                          <TableHead  className="font-bold text-center w-25">Score</TableHead>
                          <TableHead  className="font-bold text-center w-25">Progress</TableHead>
                          <TableHead  className="font-bold text-center w-25">Type</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody className="w-full">
                      {watching.map((anime) => (
                          <TableRow key={anime.mal_id} className="hover:[&>td]:bg-slate-700 transition-colors">
                              <TableCell className="font-medium rounded-l-2xl">
                                  <div className="relative group w-12.5 h-12.5 mx-auto">
                                      <Image
                                          src={anime.image_url}
                                          alt={anime.title}
                                          width={50}
                                          height={50}

                                          className="rounded-xl aspect-square object-cover group-hover:brightness-50 transition-all duration-300"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <AddToWatchlistButton anime={anime} userData={anime} />
                                      </div>
                                  </div>
                                  </TableCell>
                              <TableCell className="font-medium"><Link
                                  className="cursor-pointer block hover:font-bold" href={`/anime/${anime.mal_id}`} >{anime.title}</Link></TableCell>
                              <TableCell className="text-center">
                                  {anime.notes && (
                                  <HoverCard>
                                      <HoverCardTrigger>
                                          <MessageSquareText size={16} color="#7a8aa0" strokeWidth={0.75} />
                                      </HoverCardTrigger>
                                      <HoverCardContent className="bg-slate-800 border-slate-800">
                                          {anime.notes}
                                      </HoverCardContent>
                                  </HoverCard>
                                  )}
                              </TableCell>
                              <TableCell className="text-center">{anime.user_score}</TableCell>
                              <TableCell className="text-center">{anime.progress}/{anime.episodes}</TableCell>
                              <TableCell className="text-center rounded-r-2xl">{anime.type}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>

          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Completed
          </h2>
          <div className="flex flex-col gap-6 mb-32 bg-slate-800/50 rounded-lg p-8">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-20"></TableHead>
                          <TableHead  className="font-bold">Title</TableHead>
                          <TableHead className="w-5"></TableHead>
                          <TableHead  className="font-bold text-center w-25">Score</TableHead>
                          <TableHead  className="font-bold text-center w-25">Progress</TableHead>
                          <TableHead  className="font-bold text-center w-25">Type</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {completed.map((anime) => (
                          <TableRow key={anime.mal_id} className="hover:[&>td]:bg-slate-700 transition-colors">
                              <TableCell className="font-medium rounded-l-2xl">
                                  <div className="relative group w-12.5 h-12.5 mx-auto">
                                      <Image
                                          src={anime.image_url}
                                          alt={anime.title}
                                          width={50}
                                          height={50}

                                          className="rounded-xl aspect-square object-cover group-hover:brightness-50 transition-all duration-300"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <AddToWatchlistButton anime={anime} userData={anime} />
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell className="font-medium"><Link
                                  className="cursor-pointer block hover:font-bold" href={`/anime/${anime.mal_id}`} >{anime.title}</Link></TableCell>
                              <TableCell className="text-center">
                                  {anime.notes && (
                                      <HoverCard>
                                          <HoverCardTrigger>
                                              <MessageSquareText size={16} color="#7a8aa0" strokeWidth={0.75} />
                                          </HoverCardTrigger>
                                          <HoverCardContent className="bg-slate-800 border-slate-800">
                                              {anime.notes}
                                          </HoverCardContent>
                                      </HoverCard>
                                  )}
                              </TableCell>
                              <TableCell className="text-center">{anime.user_score}</TableCell>
                              <TableCell className="text-center">{anime.episodes}</TableCell>
                              <TableCell className="text-center rounded-r-2xl">{anime.type}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>

          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Plan to watch
          </h2>
          <div className="flex flex-col gap-6 mb-32 bg-slate-800/50 rounded-lg p-8">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-20"></TableHead>
                          <TableHead  className="font-bold">Title</TableHead>
                          <TableHead className="w-5"></TableHead>
                          <TableHead  className="font-bold text-center w-25">Type</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {planToWatch.map((anime) => (
                          <TableRow key={anime.mal_id} className="hover:[&>td]:bg-slate-700 transition-colors">
                              <TableCell className="font-medium rounded-l-2xl">
                                  <div className="relative group w-12.5 h-12.5 mx-auto">
                                      <Image
                                          src={anime.image_url}
                                          alt={anime.title}
                                          width={50}
                                          height={50}

                                          className="rounded-xl aspect-square object-cover group-hover:brightness-50 transition-all duration-300"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <AddToWatchlistButton anime={anime} userData={anime} />
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell className="font-medium"><Link
                                  className="cursor-pointer block hover:font-bold" href={`/anime/${anime.mal_id}`} >{anime.title}</Link></TableCell>
                              <TableCell className="text-center">
                                  {anime.notes && (
                                      <HoverCard>
                                          <HoverCardTrigger>
                                              <MessageSquareText size={16} color="#7a8aa0" strokeWidth={0.75} />
                                          </HoverCardTrigger>
                                          <HoverCardContent className="bg-slate-800 border-slate-800">
                                              {anime.notes}
                                          </HoverCardContent>
                                      </HoverCard>
                                  )}
                              </TableCell>
                              <TableCell className="text-center rounded-r-2xl">{anime.type}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>

          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Dropped
          </h2>
          <div className="flex flex-col gap-6 mb-32 bg-slate-800/50 rounded-lg p-8">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead className="w-20"></TableHead>
                          <TableHead  className="font-bold">Title</TableHead>
                          <TableHead className="w-5"></TableHead>
                          <TableHead  className="font-bold text-center w-25">Score</TableHead>
                          <TableHead  className="font-bold text-center w-25">Progress</TableHead>
                          <TableHead  className="font-bold text-center w-25">Type</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {dropped.map((anime) => (
                          <TableRow key={anime.mal_id} className="hover:[&>td]:bg-slate-700 transition-colors">
                              <TableCell className="font-medium rounded-l-2xl">
                                  <div className="relative group w-12.5 h-12.5 mx-auto">
                                      <Image
                                          src={anime.image_url}
                                          alt={anime.title}
                                          width={50}
                                          height={50}

                                          className="rounded-xl aspect-square object-cover group-hover:brightness-50 transition-all duration-300"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <AddToWatchlistButton anime={anime} userData={anime} />
                                      </div>
                                  </div>
                              </TableCell>
                              <TableCell className="font-medium"><Link
                                  className="cursor-pointer block hover:font-bold" href={`/anime/${anime.mal_id}`} >{anime.title}</Link></TableCell>
                              <TableCell className="text-center">
                                  {anime.notes && (
                                      <HoverCard>
                                          <HoverCardTrigger>
                                              <MessageSquareText size={16} color="#7a8aa0" strokeWidth={0.75} />
                                          </HoverCardTrigger>
                                          <HoverCardContent className="bg-slate-800 border-slate-800">
                                              {anime.notes}
                                          </HoverCardContent>
                                      </HoverCard>
                                  )}
                              </TableCell>
                              <TableCell className="text-center">{anime.user_score}</TableCell>
                              <TableCell className="text-center">{anime.progress}/{anime.episodes}</TableCell>
                              <TableCell className="text-center rounded-r-2xl">{anime.type}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>
          <SuggestAI />
      </div>
  );
}
