import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
    const { username } = await request.json();

    if (typeof username !== "string") {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }


    const client = await clientPromise;
    const usersCollection = await client.db("anilog").collection("users");
    const currentUser = await usersCollection.findOne(username);

    if (!currentUser){
        return NextResponse.json({error: "User not found"}, {status: 404});
    }

    return currentUser.findOne({
        displayName: {username}
    }).project({
        displayName: 1,
        photoURL: 1,
        isPublic: 1,
        _id: 0
    }).toArray()
}