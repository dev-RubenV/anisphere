import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {ObjectId} from "mongodb";
import { getAuthenticatedUser, getUserIdForStorage } from "@/lib/auth";

export async function DELETE(request){
 try {
     // Autenticação via cookie ou bearer token
     const currentUser = await getAuthenticatedUser();
     if (!currentUser) {
         return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
     }

     const userId = getUserIdForStorage(currentUser);
     const { anime } = await request.json();

     if(!anime?.mal_id){
         return NextResponse.json({error: "Anime ID missing"}, {status: 400});
     }

     const client = await clientPromise;
     const db = client.db("anisphere");
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
        return NextResponse.json( {error: "Failed to remove data"}, {status: 500});}
    }

export async function POST(request){
    try {
        // Autenticação via cookie ou bearer token
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const userId = getUserIdForStorage(currentUser);
        const username = currentUser.displayName;

        const { anime, user_score, status, notes, progress, isFavorite} = await request.json();

        if (!anime || !anime.mal_id || user_score === undefined || progress === undefined) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("anisphere");
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
        const db = client.db("anisphere");

        // Verificação de privacidade: ao buscar por username, verifica se o perfil é público
        if (username) {
            const profileOwner = await db.collection("users").findOne(
                { displayName: username },
                { projection: { isPublic: 1, _id: 1, firebaseUid: 1 } }
            );

            if (profileOwner && profileOwner.isPublic === false) {
                // Verificar se o pedido vem do dono do perfil
                // Suporta tanto cookie como bearer token via getAuthenticatedUser
                const currentUser = await getAuthenticatedUser();
                let isOwner = false;

                if (currentUser) {
                    isOwner = (
                        profileOwner._id.toString() === currentUser._id.toString() ||
                        profileOwner.firebaseUid === currentUser.firebaseUid
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