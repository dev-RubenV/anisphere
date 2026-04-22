import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {ObjectId} from "mongodb";

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
        const { anime, userId, username, user_score, status, notes, progress, isFavorite} = await request.json();

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
                    username: username,
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
        const username = searchParams.get('username');
        const status = searchParams.get('status');

        if(!userId && !username) return NextResponse.json({ error: "No user found." }, {status: 400});

        const client = await clientPromise;
        const db = client.db("anilog");

        // Privacy enforcement: when fetching by username, check if the profile is public
        if (username) {
            const profileOwner = await db.collection("users").findOne(
                { displayName: username },
                { projection: { isPublic: 1, _id: 1, firebaseUid: 1 } }
            );

            if (profileOwner && profileOwner.isPublic === false) {
                // Allow the owner to see their own list
                const cookieStore = await cookies();
                const cookieUserId = cookieStore.get("userId")?.value;

                let isOwner = false;
                if (cookieUserId) {
                    // Check if cookie matches _id or firebaseUid
                    isOwner = (
                        profileOwner._id.toString() === cookieUserId ||
                        profileOwner.firebaseUid === cookieUserId
                    );
                }

                if (!isOwner) {
                    return NextResponse.json({ error: "This user's list is private" }, { status: 403 });
                }
            }
        }

        let query = {}

        if(username){
            query.username = username;
        } else {
           query.userId = userId;
        }

        if (status) {
            query.status = status;
        }

        const watchlist = await db.collection("watchlist")
            .find(query)
            .project({
                _id: 0,
                mal_id: 1,
                anime_score: 1,
                episodes: 1,
                image_url: 1,
                isFavorite: 1,
                notes: 1,
                progress: 1,
                status: 1,
                title: 1,
                type: 1,
                user_score: 1,
                username: 1
            })
            .sort({ updatedAt: -1 })
            .toArray();

        return NextResponse.json(watchlist);

    } catch (error) {
        console.error("Watchlist Fetch Error:", error);
        return NextResponse.json({ error: "Internal Error" }, {status: 500});
    }
}