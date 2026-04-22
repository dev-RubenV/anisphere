import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    // 1. Get the username from the URL
    const username = params?.username;

    if (!username) {
        return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("anilog");

        // Define your two collections
        const usersCollection = db.collection("users");
        const watchlistCollection = db.collection("watchlist"); // Adjust name if yours is different

        // 2. Fetch the user profile FIRST
        const profileUser = await usersCollection.findOne(
            { displayName: username }, // Find by username
            { projection: { displayName: 1, photoURL: 1, isPublic: 1, _id: 1 } }
        );

        if (!profileUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. THE SECURITY BOUNCER
        // If the user exists but is explicitly set to private
        if (profileUser.isPublic === false) {
            return NextResponse.json({
                displayName: profileUser.displayName,
                photoURL: profileUser.photoURL,
                isPublic: false,
                watchlist: [] // <-- Locked! We skip the second database query completely.
            });
        }

        // 4. IF PUBLIC: Go fetch the data from the second collection
        // Based on your earlier code, it looks like you save the anime with the username attached
        const userWatchlist = await watchlistCollection.find({
            username: username
        }).toArray();

        // 5. Send the combined data back to the frontend
        return NextResponse.json({
            displayName: profileUser.displayName,
            photoURL: profileUser.photoURL,
            isPublic: true,
            watchlist: userWatchlist // Send the actual array we just fetched
        });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}