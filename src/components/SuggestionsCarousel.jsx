"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Star, Tv, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * Um único cartão de sugestão exibido dentro do carrossel.
 */
function SuggestionCard({ suggestion, index, total }) {
    const { title, title_english, reason, image_url, url, score, episodes, genres, mal_id } = suggestion;

    return (
        <div className="suggestion-card">
            {/* Esquerda: Poster do Anime */}
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
                {/* Emblema do contador */}
                <span className="suggestion-card__badge">
                    {index + 1} / {total}
                </span>
            </div>

            {/* Direita: Informações */}
            <div className="suggestion-card__info">
                {/* Título */}
                <h3 className="suggestion-card__title">{title_english || title}</h3>

                {/* Linha de metadados */}
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

                {/* Razão da IA */}
                <p className="suggestion-card__reason">{reason}</p>

                {/* Link interno para a página de detalhe do anime */}
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
 * Wrapper principal do carrossel.
 * Props:
 *   suggestions – array de objetos de sugestão enriquecidos
 *   message     – a mensagem introdutória da IA
 */
export function SuggestionsCarousel({ suggestions, message }) {
    const [active, setActive] = useState(0);
    const total = suggestions.length;

    const prev = () => setActive((a) => (a - 1 + total) % total);
    const next = () => setActive((a) => (a + 1) % total);

    if (!suggestions || total === 0) return null;

    return (
        <div className="suggestions-carousel">
            {/* Cabeçalho */}
            <div className="suggestions-carousel__header">
                <Sparkles className="w-5 h-5 text-[#FD8D32]" />
                <p className="suggestions-carousel__message">{message}</p>
            </div>

            {/* Área do cartão */}
            <div className="suggestions-carousel__stage">
                {/* Botão anterior */}
                <button
                    onClick={prev}
                    className="suggestions-carousel__nav suggestions-carousel__nav--prev"
                    aria-label="Previous suggestion"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {/* O cartão ativo */}
                <div className="suggestions-carousel__card-wrap">
                    <SuggestionCard
                        key={active}
                        suggestion={suggestions[active]}
                        index={active}
                        total={total}
                    />
                </div>

                {/* Botão seguinte */}
                <button
                    onClick={next}
                    className="suggestions-carousel__nav suggestions-carousel__nav--next"
                    aria-label="Next suggestion"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Indicadores de pontos */}
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
