'use client'; // Required for user interaction
import Link from "next/link";
import { useState } from 'react';

export default function AnimeSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    async function handleSearch() {
        // 1. Call the API directly
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
        const data = await response.json();

        // 2. Jikan returns the data inside a "data" property
        setResults(data.data);
    }

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anime..."
            />
            <button onClick={handleSearch}>Search</button>

            <div className="grid">
                {results.map((anime) => (
                    <div key={anime.mal_id}>
                        <img src={anime.images.jpg.image_url} alt={anime.title} />
                        <h3>{anime.title}</h3>
                        <Link href={`/anime/${anime.mal_id}`} className="text-zinc-400 hover:text-white transition-colors">
                            Go to Anime
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}