import {useRouter} from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {Button} from "@/components/ui/button";
import { BotMessageSquare, Loader2, History, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {useState, useEffect} from "react";
import { SuggestionsCarousel } from "@/components/SuggestionsCarousel";


export function SuggestAI({ animeData }) {
    const { user } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Histórico de sessões de sugestões carregado do MongoDB
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Qual sessão do histórico está expandida (índice no array `history`), ou -1 para nenhuma
    const [expandedIndex, setExpandedIndex] = useState(-1);

    // Carrega o histórico de sugestões guardadas quando o utilizador está disponível
    useEffect(() => {
        if (!user) return;
        const userId = user.id || user._id;
        if (!userId) return;

        setHistoryLoading(true);
        fetch(`/api/suggestions?userId=${userId}&limit=10`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setHistory(data);
                    if (data.length > 0) setExpandedIndex(0);
                }
            })
            .catch(console.error)
            .finally(() => setHistoryLoading(false));
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Busca a watchlist do utilizador
            const listRes = await fetch(`/api/watchlist?userId=${user.id || user._id}`);
            const currentUserAnimeData = await listRes.json();

            // 2. Recolhe todos os títulos previamente sugeridos do histórico para a IA evitar repetições
            const previousSuggestions = history.flatMap(
                (session) => session.suggestions?.map((s) => s.title_english || s.title) ?? []
            );

            // 3. Pede sugestões ao Gemini (passando o contexto do histórico)
            const aiRes = await fetch("/api/suggest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentUserAnimeData,
                    animeData,
                    displayName: user.displayName,
                    previousSuggestions,
                })
            });

            if (!aiRes.ok) throw new Error("AI API request failed");
            const recommendationData = await aiRes.json();
            setIsLoading(false);

            // 4. Guarda e enriquece via /api/suggestions
            setIsSaving(true);
            const saveRes = await fetch("/api/suggestions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id || user._id,
                    message: recommendationData.message,
                    suggestions: recommendationData.suggestions,
                })
            });

            if (saveRes.ok) {
                const saved = await saveRes.json();
                const newSession = {
                    message: recommendationData.message,
                    suggestions: saved.suggestions,
                    createdAt: new Date().toISOString(),
                };
                setHistory((prev) => [newSession, ...prev]);
                setExpandedIndex(0);
            }

        } catch (error) {
            console.error("Failed to get suggestions:", error);
        } finally {
            setIsLoading(false);
            setIsSaving(false);
        }
    };

    const buttonLabel = isLoading
        ? "Thinking..."
        : isSaving
            ? "Enriching results..."
            : "Ask AI for Suggestions";

    return (
        <div className="flex flex-col gap-4 mt-6">
            <Button
                onClick={handleSubmit}
                disabled={isLoading || isSaving}
                className="cursor-pointer text-white transition-all bg-[#FD8D32] hover:bg-[#e07a28] hover:-translate-y-0.5 w-fit shadow-sm px-6 font-medium rounded-lg"
            >
                {buttonLabel}
                {(isLoading || isSaving)
                    ? <Loader2 className="animate-spin ml-2 w-4 h-4" />
                    : <BotMessageSquare className="ml-2 w-5 h-5" />
                }
            </Button>

            {/* Esqueleto de carregamento do histórico */}
            {historyLoading && (
                <div className="sh-skeleton-wrap">
                    {[0,1,2].map(i => (
                        <div key={i} className="sh-skeleton" />
                    ))}
                </div>
            )}

            {/* Histórico de sugestões */}
            {!historyLoading && history.length > 0 && (
                <div className="sh">
                    {/* Cabeçalho da secção */}
                    <div className="sh__header">
                        <History className="w-4 h-4 text-[#FD8D32]" />
                        <span className="sh__header-label">Suggestion History</span>
                        <span className="sh__header-count">{history.length} session{history.length !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Sessões */}
                    <div className="sh__list">
                        {history.map((session, i) => {
                            const isOpen = expandedIndex === i;
                            const date = session.createdAt
                                ? new Date(session.createdAt).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent";
                            const time = session.createdAt
                                ? new Date(session.createdAt).toLocaleTimeString("en-GB", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "";
                            const previews = session.suggestions?.slice(0, 3) ?? [];

                            return (
                                <div key={i} className={`sh__item ${isOpen ? "sh__item--open" : ""}`}>
                                    {/* Linha clicável do cabeçalho */}
                                    <button
                                        className="sh__row"
                                        onClick={() => setExpandedIndex(isOpen ? -1 : i)}
                                        aria-expanded={isOpen}
                                    >
                                        {/* Miniaturas de posters empilhadas */}
                                        <div className="sh__thumbs">
                                            {previews.map((s, pi) => (
                                                s.image_url
                                                    ? <img
                                                        key={pi}
                                                        src={s.image_url}
                                                        alt={s.title_english || s.title}
                                                        className="sh__thumb"
                                                        style={{ zIndex: 3 - pi, transform: `translateX(${pi * 18}px)` }}
                                                      />
                                                    : <div
                                                        key={pi}
                                                        className="sh__thumb sh__thumb--placeholder"
                                                        style={{ zIndex: 3 - pi, transform: `translateX(${pi * 18}px)` }}
                                                      >
                                                        <Sparkles className="w-3 h-3 text-[#FD8D32]/50" />
                                                      </div>
                                            ))}
                                        </div>

                                        {/* Títulos + data */}
                                        <div className="sh__row-info">
                                            <span className="sh__row-titles">
                                                {previews.map((s) => s.title_english || s.title).join(" · ")}
                                            </span>
                                            <span className="sh__row-date">
                                                {date}{time ? ` · ${time}` : ""}
                                            </span>
                                        </div>

                                        {/* Seta */}
                                        <span className="sh__chevron">
                                            {isOpen
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                            }
                                        </span>
                                    </button>

                                    {/* Carrossel expandido */}
                                    {isOpen && (
                                        <div className="sh__body">
                                            <SuggestionsCarousel
                                                suggestions={session.suggestions}
                                                message={session.message}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}