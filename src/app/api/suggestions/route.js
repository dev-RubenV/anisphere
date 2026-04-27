import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

/**
 * Enriches a suggestion title with data from the Jikan API (MAL).
 * Returns image_url, mal_id, and url for the anime if found.
 */
async function enrichWithJikan(title) {
    try {
        const encoded = encodeURIComponent(title);
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encoded}&limit=1`, {
            // Jikan has rate limiting (3 req/sec), so we give it a bit of time
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

/**
 * POST /api/suggestions
 * Body: { userId, suggestions: [{title, reason, mal_id}], message }
 * Enriches each suggestion with Jikan data, then saves to MongoDB.
 */
export async function POST(request) {
    try {
        const { userId, suggestions, message } = await request.json();

        if (!userId || !Array.isArray(suggestions) || suggestions.length === 0) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Enrich each suggestion with Jikan data sequentially to respect rate limits
        const enriched = [];
        for (const s of suggestions) {
            // Add a small delay between requests to respect Jikan rate limit (3/s)
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

        const doc = {
            userId,
            message,
            suggestions: enriched,
            createdAt: new Date(),
        };

        await db.collection("suggestions").insertOne(doc);

        return NextResponse.json({ success: true, suggestions: enriched }, { status: 201 });
    } catch (error) {
        console.error("Suggestions POST error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * GET /api/suggestions?userId=xxx&limit=5
 * Returns the most recent suggestion sessions for a user.
 */
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
