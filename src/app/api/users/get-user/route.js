import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { escapeRegExp } from "@/lib/utils";

// 1. MUST be named GET (not getUser)
export async function GET(request) {
    // 2. Extract the username from the URL (e.g., /api/users/get-user?query=username)
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db("anisphere");
        const usersCollection = await db.collection("users");

        // 3. Use findOne() to get the actual user object, not a cursor
        // Escape de regex para prevenir ReDoS
        const safeQuery = escapeRegExp(query);
        const user = await usersCollection.findOne(
            {
                displayName: {
                    $regex: `^${safeQuery}$`, // ^ and $ for exact match
                    $options: "i"
                }
            },
            {
                projection: {
                    displayName: 1,
                    photoURL: 1,
                    createdAt: 1,
                    _id: 0
                }
            }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 4. Return as JSON
        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}