export async function getAnimeDetails(id){
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    if (!response.ok) throw new Error("Failed to fetch anime");
    const data = await response.json();
    const anime = data.data;

    return anime;
}