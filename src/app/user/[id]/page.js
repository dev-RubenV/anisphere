'use client'
import * as React from "react"
import { Lock, Play, CircleCheck, Bookmark, CircleX} from 'lucide-react';
import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {useParams} from "next/navigation";
import {SuggestAI} from "@/components/SuggestAI";
import { AnimeListSection } from "@/components/AnimeListSection";
import UserCard from "@/components/UserCard";

export default function UserProfilePage () {

    // OBTÉM O USERNAME USANDO O HOOK
    const params = useParams();
    const username = params.id;


    const [userData, setUserData] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const watching = watchlist.filter((anime) => anime.status === "Watching");
    const completed = watchlist.filter((anime) => anime.status === "Completed");
    const planToWatch = watchlist.filter((anime) => anime.status === "Plan to watch");
    const dropped = watchlist.filter((anime) => anime.status === "Dropped");
    const [isLoading, setIsLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(false);

    const { user, loading} = useAuth();

    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchWatchlist = async () => {
            if (!user || !username) return;

            try {
                const [watchListResponse, userDataResponse] = await Promise.all([
                    fetch(`/api/watchlist?username=${username}`),
                    fetch(`/api/users/get-user?query=${username}`),
                ]);

                // Tratar lista privada
                if (watchListResponse.status === 403) {
                    setIsPrivate(true);
                    setWatchlist([]);
                    return;
                }

                // Lança erro explicitamente para que o catch consiga mostrar o problema real
                if (!watchListResponse.ok) {
                    throw new Error(`Watchlist fetch failed: ${watchListResponse.status}`);
                }
                if (!userDataResponse.ok) {
                    throw new Error(`User data fetch failed: ${userDataResponse.status}`);
                }

                const [watchListData, userDataData] = await Promise.all([
                    watchListResponse.json(),
                    userDataResponse.json(),
                ]);

                setWatchlist(watchListData);
                setUserData(userDataData);
                setIsPrivate(false);

            } catch (error) {
                // Regista o erro REAL para ser possível identificar o problema
                console.error("Failed to fetch watchlist:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWatchlist();
    }, [user, username]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center py-20 w-full">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#FD8D32]/30 border-t-[#FD8D32] rounded-full animate-spin"></div>
                    <p className="text-[#4A5568] text-sm">Loading {username}&apos;s list...</p>
                </div>
            </div>
        );
    }

    if(isPrivate) return(
      <div className="flex flex-col items-center justify-center gap-5 mt-24 p-10 aura-card max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-[#F2F4F6] rounded-full flex items-center justify-center">
              <Lock size={32} className="text-[#4A5568]" />
          </div>
          <p className="text-lg text-[#1A202E] leading-relaxed">
              <span className="font-bold">{username}&apos;s</span> list is <span className="font-bold text-[#BA1A1A]">private</span>.<br/>
              <span className="text-sm text-[#4A5568] font-normal">You don&apos;t have permission to see it.</span>
          </p>
      </div>
    );

    return (
        <div className="w-full space-y-2">
            <UserCard animeData={watchlist} username={username} joinedAt={userData.createdAt} photoURL={userData?.photoURL} />
            <AnimeListSection icon={<Play className="fill-primary"/>} title="Watching" animeList={watching} showScore={true} showProgress={true} iconOnly={false} />
            <AnimeListSection icon={<CircleCheck className="fill-primary"/>} title="Completed" animeList={completed} showScore={true} showProgress={true} iconOnly={false} />
            <AnimeListSection icon={<Bookmark className="fill-primary"/>} title="Plan to Watch" animeList={planToWatch} showScore={false} showProgress={false} iconOnly={false} />
            <AnimeListSection icon={<CircleX className="fill-primary"/>} title="Dropped" animeList={dropped} showScore={true} showProgress={true} iconOnly={false} />
            <SuggestAI animeData={watchlist} />
        </div>
    );
}
