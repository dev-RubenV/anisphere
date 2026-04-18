import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";

export async function DELETE(request){
 try {
     const {anime, userId} = await request.json();
     if(!userId || !anime.mal_id){
         return NextResponse.json({status: "User or Anime ID missing"}, {status: 400});
     }

     const client = await clientPromise;
     const db = client.db("anilog");
     const result = await db.collection("watchlist").deleteOne(
         {
         userId: userId,
         mal_id: anime.mal_id,
         }
     );

     if (result.deletedCount === 0) {
         return NextResponse.json({ message: "Item not found" }, { status: 404 });
     }

     return NextResponse.json({ success: true, message: "Deleted successfully" }, { status: 200 });

    }
    catch(error) {
        return NextResponse.json( {error: "Failed to remove data"}, error);}
    }

export async function POST(request){
    try {
        const { anime, userId, user_score, status, notes, progress, isFavorite} = await request.json();

        if (!userId || !anime || !anime.mal_id || user_score === undefined || progress === undefined) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("anilog");
        const result = await db.collection("watchlist").updateOne(
            {
                userId: userId,
                mal_id: anime.mal_id
            },
            {
                $set: {
                    userId: userId,
                    mal_id: anime.mal_id,
                    title: anime.title_english || anime.title,
                    image_url: anime.image_url || anime.images?.jpg?.image_url,
                    type: anime.type,
                    episodes: anime.episodes,
                    anime_score: anime.score,
                    user_score: user_score,
                    status: status,
                    progress: progress,
                    notes: notes,
                    isFavorite: isFavorite,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            message: "Added to watchlist"
        });

    } catch(error)  {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

}

export async function GET(request){

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');


        if(!userId) return NextResponse.json({ error: "No user found." }, {status: 400});

        const query = { userId: userId };

        if (status) {
            query.status = status;
        }

        const client = await clientPromise;
        const db = client.db("anilog");

        const watchlist = await db.collection("watchlist")
            .find(query)
            .sort({ updatedAt: -1 })
            .toArray();
        return NextResponse.json(watchlist);

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, {status: 500});
    }

}