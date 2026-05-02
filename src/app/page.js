'use client'
import * as React from "react"
import { CirclePlay, Play, CircleX, CircleCheck, Bookmark } from 'lucide-react';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {SuggestAI} from "@/components/SuggestAI";
import { AnimeListSection } from "@/components/AnimeListSection";
import UserCard from "@/components/UserCard";

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

  return (
      <div className="w-full space-y-2">
          <UserCard animeData={watchlist} username={user.displayName} photoURL={user?.photoURL} joinedAt={user.createdAt} />
          <AnimeListSection icon={<Play className="fill-primary"/>} title="Watching" animeList={watching} showScore={true} showProgress={true} iconOnly={true} />
          <AnimeListSection icon={<CircleCheck className="fill-primary"/>} title="Completed" animeList={completed} showScore={true} showProgress={true} iconOnly={true} />
          <AnimeListSection icon={<Bookmark className="fill-primary"/>} title="Plan to Watch" animeList={planToWatch} showScore={false} showProgress={false} iconOnly={true} />
          <AnimeListSection icon={<CircleX className="fill-primary"/>} title="Dropped" animeList={dropped} showScore={true} showProgress={true} iconOnly={true} />
          <SuggestAI />
      </div>
  );
}
