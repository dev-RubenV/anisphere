import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
    try {

        const { currentUserAnimeData, animeData, displayName, previousSuggestions } = await request.json();

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

        // Build a plain list of previously suggested titles so Gemini avoids repeating them
        const alreadySuggested = Array.isArray(previousSuggestions) && previousSuggestions.length > 0
            ? `You have already suggested these anime to ${displayName} in previous sessions, DO NOT suggest them again: ${previousSuggestions.join(", ")}. `
            : "";

        let prompt;
        if (!animeData) {
            prompt = `You are an expert anime recommender. Here is ${displayName}'s anime list: ${JSON.stringify(currentUserAnimeData)}. ${alreadySuggested}Recommend exactly 3 high-quality anime they HAVE NOT watched yet and that you have NOT previously recommended.`;
        } else {
             prompt = `You are an expert anime recommender. Compare ${displayName}'s anime list: ${JSON.stringify(currentUserAnimeData)} with this other user's list: ${JSON.stringify(animeData)}. ${alreadySuggested}Recommend exactly 3 anime that ${displayName} HAS NOT watched yet and that you have NOT previously recommended.`;
        }

        const config = {
             responseMimeType: "application/json",
             responseSchema: recommendationSchema,
        };

        let response;
        try {
             // Primary Model
             response = await ai.models.generateContent({
                  model: "gemini-3-flash-preview",
                  contents: prompt,
                  config: config
             });
        } catch (error) {
             console.warn("Primary model (gemini-3-flash-preview) failed, falling back to gemini-2.5-flash:", error);
             // Fallback Model
             try {
                 response = await ai.models.generateContent({
                      model: "gemini-2.5-flash",
                      contents: prompt,
                      config: config
                 });
             } catch (fallbackError) {
                  console.error("Fallback model (gemini-2.5-flash) also failed:", fallbackError);
                  throw fallbackError; // Re-throw to be caught by the outer catch block
             }
        }

        const recommendationData = JSON.parse(response.text);
        return NextResponse.json(recommendationData);

    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: "Failed to obtain AI response" }, { status: 500 });
    }
}