import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, getUserIdForStorage } from "@/lib/auth";

async function enrichWithJikan(title) {
    try {
        const encoded = encodeURIComponent(title);
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encoded}&limit=1`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/[IP_ADDRESS] Safari/537.36"
            },
            next: { revalidate: 0 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const anime = data?.data?.[0];
        if (!anime) return null;
        return {
            mal_id: anime.mal_id,
            url: anime.url,
            image_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
            title_english: anime.title_english || anime.title,
            episodes: anime.episodes || null,
            score: anime.score || null,
            genres: anime.genres?.map((g) => g.name) || [],
        };
    } catch {
        return null;
    }
}

export async function POST(request) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const userId = getUserIdForStorage(currentUser);
        const { suggestions, message } = await request.json();

        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const enriched = [];
        for (const s of suggestions) {
            if (enriched.length > 0) {
                await new Promise((r) => setTimeout(r, 400));
            }
            const jikanData = await enrichWithJikan(s.title);
            enriched.push({
                title: s.title,
                reason: s.reason,
                mal_id: jikanData?.mal_id ?? s.mal_id ?? null,
                url: jikanData?.url ?? null,
                image_url: jikanData?.image_url ?? null,
                title_english: jikanData?.title_english ?? s.title,
                episodes: jikanData?.episodes ?? null,
                score: jikanData?.score ?? null,
                genres: jikanData?.genres ?? [],
            });
        }

        const client = await clientPromise;
        const db = client.db("anisphere");

        await db.collection("suggestions").insertOne({
            userId,
            message,
            suggestions: enriched,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, suggestions: enriched }, { status: 201 });
    } catch (error) {
        console.error("Suggestions POST error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const limit = parseInt(searchParams.get("limit") || "5", 10);

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("anisphere");

        const results = await db
            .collection("suggestions")
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return NextResponse.json(results);
    } catch (error) {
        console.error("Suggestions GET error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
