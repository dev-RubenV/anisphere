"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Star, Tv, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * A single suggestion card displayed inside the carousel.
 */
function SuggestionCard({ suggestion, index, total }) {
    const { title, title_english, reason, image_url, url, score, episodes, genres, mal_id } = suggestion;

    return (
        <div className="suggestion-card">
            {/* Left: Anime Poster */}
            <div className="suggestion-card__poster-wrap">
                {image_url ? (
                    <img
                        src={image_url}
                        alt={title_english || title}
                        className="suggestion-card__poster"
                    />
                ) : (
                    <div className="suggestion-card__poster-placeholder">
                        <Sparkles className="w-10 h-10 text-[#FD8D32]/40" />
                    </div>
                )}
                {/* Counter badge */}
                <span className="suggestion-card__badge">
                    {index + 1} / {total}
                </span>
            </div>

            {/* Right: Info */}
            <div className="suggestion-card__info">
                {/* Title */}
                <h3 className="suggestion-card__title">{title_english || title}</h3>

                {/* Meta row */}
                <div className="suggestion-card__meta">
                    {score && (
                        <span className="suggestion-card__meta-pill suggestion-card__meta-pill--score">
                            <Star className="w-3.5 h-3.5" />
                            {score.toFixed(1)}
                        </span>
                    )}
                    {episodes && (
                        <span className="suggestion-card__meta-pill suggestion-card__meta-pill--eps">
                            <Tv className="w-3.5 h-3.5" />
                            {episodes} ep
                        </span>
                    )}
                    {genres?.slice(0, 3).map((g) => (
                        <span key={g} className="suggestion-card__meta-pill suggestion-card__meta-pill--genre">
                            {g}
                        </span>
                    ))}
                </div>

                {/* AI reason */}
                <p className="suggestion-card__reason">{reason}</p>

                {/* Internal anime detail link */}
                {mal_id ? (
                    <Link
                        href={`/anime/${mal_id}`}
                        className="suggestion-card__link"
                    >
                        View Anime Page
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                ) : (
                    <span className="suggestion-card__link suggestion-card__link--disabled">
                        Page unavailable
                    </span>
                )}
            </div>
        </div>
    );
}

/**
 * Main carousel wrapper.
 * Props:
 *   suggestions – array of enriched suggestion objects
 *   message     – the AI's intro message
 */
export function SuggestionsCarousel({ suggestions, message }) {
    const [active, setActive] = useState(0);
    const total = suggestions.length;

    const prev = () => setActive((a) => (a - 1 + total) % total);
    const next = () => setActive((a) => (a + 1) % total);

    if (!suggestions || total === 0) return null;

    return (
        <div className="suggestions-carousel">
            {/* Header */}
            <div className="suggestions-carousel__header">
                <Sparkles className="w-5 h-5 text-[#FD8D32]" />
                <p className="suggestions-carousel__message">{message}</p>
            </div>

            {/* Card area */}
            <div className="suggestions-carousel__stage">
                {/* Prev button */}
                <button
                    onClick={prev}
                    className="suggestions-carousel__nav suggestions-carousel__nav--prev"
                    aria-label="Previous suggestion"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* The active card */}
                <div className="suggestions-carousel__card-wrap">
                    <SuggestionCard
                        key={active}
                        suggestion={suggestions[active]}
                        index={active}
                        total={total}
                    />
                </div>

                {/* Next button */}
                <button
                    onClick={next}
                    className="suggestions-carousel__nav suggestions-carousel__nav--next"
                    aria-label="Next suggestion"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Dot indicators */}
            <div className="suggestions-carousel__dots">
                {suggestions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`suggestions-carousel__dot ${i === active ? "suggestions-carousel__dot--active" : ""}`}
                        aria-label={`Go to suggestion ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
