import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getAuthenticatedUser, getUserIdForStorage } from "@/lib/auth";

export async function DELETE(request){
    try {
        // Autenticação via cookie httpOnly — nunca confiar no userId do body
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { password } = await request.json();

        if (password && typeof password !== "string") {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        if(currentUser.provider !== "google") {
            if(!await bcrypt.compare(password, currentUser.password)){
                return NextResponse.json({error: "Wrong password, please try again"}, { status: 400 });
            }
        }

        const client = await clientPromise;

        // Usa o userId correto para queries na coleção watchlist
        const storageId = getUserIdForStorage(currentUser);
        await client.db("anisphere").collection("watchlist").deleteMany({ userId: storageId });
        await client.db("anisphere").collection("suggestions").deleteMany({ userId: storageId });

        await client.db("anisphere").collection("users").deleteOne({ _id: currentUser._id });

        // Limpar o cookie de sessão
        const cookieStore = await cookies();
        cookieStore.delete('userId');

        return NextResponse.json({message: "Your account has been deleted successfully"});
    } catch (error) {
        console.error("Delete account error:", error);
        return NextResponse.json({error: "Internal server error"}, { status: 500 });
    }
}