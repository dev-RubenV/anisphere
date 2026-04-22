import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {ObjectId} from "mongodb";

export async function POST(request){

    try{
        const {isPublic} = await request.json();

        if (typeof isPublic !== "boolean") {
            return NextResponse.json({error: "Invalid data format"}, {status: 400});
        }

        // Authenticate via httpOnly cookie
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;

        if (!userId) {
            return NextResponse.json({error: "Not authenticated"}, {status: 401});
        }

        const client = await clientPromise;
        const usersCollection = client.db("anilog").collection("users");

        // Find user by cookie userId — try both ObjectId and firebaseUid
        let user;
        try {
            user = await usersCollection.findOne({_id: new ObjectId(userId)});
        } catch (e) {
            // Not a valid ObjectId, try as firebaseUid
        }

        if (!user) {
            user = await usersCollection.findOne({firebaseUid: userId});
        }

        if(!user){
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        await usersCollection.updateOne(
            {_id: user._id},
            {$set: {
                isPublic: isPublic
            }}
        )

        return NextResponse.json({message: "Successfully updated user watchlist visibility"}, {status: 200});

    } catch(error){
        return NextResponse.json({error: "Failed to change visibility of watchlist"}, {status: 500});
    }
}