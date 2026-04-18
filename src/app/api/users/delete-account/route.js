import clientPromise from "@/lib/mongodb";
import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {cookies} from "next/headers";
import { ObjectId } from "mongodb";

export async function DELETE(request){
    try {
        const {password, userId} = await request.json();

        if (typeof userId !== "string" || (password && typeof password !== "string")) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        let userQuery;

        // Se for um ID válido do MongoDB (exatamente 24 caracteres hexadecimais)
        if(ObjectId.isValid(userId) && String(new ObjectId(userId)) === userId){
            userQuery = { _id: new ObjectId(userId) };
        } else {
            userQuery = { firebaseUid: userId };
        }

        const client = await clientPromise;
        const usersCollection = await client.db("anilog").collection("users");
        const currentUser = await usersCollection.findOne(userQuery);

        if (!currentUser){
            return NextResponse.json({error: "User not found"}, {status: 404});
        }

        if(currentUser.provider !== "google") {
            if(!await bcrypt.compare(password, currentUser.password)){
                return NextResponse.json({error: "Wrong password, please try again"}, { status: 400 });
            }
        }

        await client.db("anilog").collection("watchlist").deleteMany({ userId: userId });

        await usersCollection.deleteOne(userQuery);

        return NextResponse.json({message: "Your account has been deleted successfully"});
    } catch (error) {
        return NextResponse.json({error: error.message}, { status: 500 });
    }
}