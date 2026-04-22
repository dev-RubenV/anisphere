import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
    try {

        const { currentUserAnimeData, animeData, displayName } = await request.json();

        const ai = new GoogleGenAI({});

        const recommendationSchema = {
            type: "OBJECT",
            properties: {
                message: { type: "STRING" },
                suggestions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING" },
                            mal_id: { type: "INTEGER" },
                            reason: { type: "STRING" }
                        },
                        required: ["title", "mal_id", "reason"]
                    }
                }
            },
            required: ["message", "suggestions"]
        };

        let response;
        if (!animeData) {
            response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `You are an expert anime recommender. Here is ${displayName}'s anime list: ${JSON.stringify(currentUserAnimeData)}. Recommend exactly 3 high-quality anime they HAVE NOT watched yet.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: recommendationSchema,
                }
            });
        } else {
            response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `You are an expert anime recommender. Compare ${displayName}'s anime list: ${JSON.stringify(currentUserAnimeData)} with this other user's list: ${JSON.stringify(animeData)}. Recommend exactly 3 anime that ${displayName} HAS NOT watched yet.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: recommendationSchema,
                }
            });
        }

        const recommendationData = JSON.parse(response.text);
        return NextResponse.json(recommendationData);

    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: "Failed to obtain AI response" }, { status: 500 });
    }
}