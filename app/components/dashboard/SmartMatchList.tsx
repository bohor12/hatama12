"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, MessageCircle, AlertCircle, Heart } from "lucide-react";

export default function SmartMatchList() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/matches/smart")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMatches(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="w-full h-40 flex items-center justify-center bg-white/50 rounded-3xl animate-pulse">
            <div className="flex flex-col items-center gap-2 opacity-50">
                <Heart className="animate-bounce text-pink-400" />
                <span className="text-sm font-medium text-gray-500">Iščem ujemanja...</span>
            </div>
        </div>
    );

    if (matches.length === 0) return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <AlertCircle className="text-gray-400" size={32} />
            </div>
            <div>
                <p className="font-bold text-gray-800 text-lg">Ni še dovolj podatkov za algoritem.</p>
                <Link href="/profile/preferences" className="text-pink-600 font-bold hover:underline mt-1 inline-block">
                    Nastavi svoje želje tukaj 👉
                </Link>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
                <div key={match.id} className="relative group bg-white p-5 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-pink-200">

                    {/* Compatibility Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                        {match.score > 50 ? "SUPER MATCH 🔥" : "UJEMANJE ✨"}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative border-2 border-white shadow-md">
                            {match.photos ? (
                                <img src={JSON.parse(match.photos)[0]} alt={match.name} className="w-full h-full object-cover blur-sm hover:blur-none transition-all duration-500 cursor-pointer" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-800 to-black text-pink-500">
                                    {/* Using a Mask-like visual (or just generic icon representing anonymity) */}
                                    <span className="text-2xl">🎭</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 leading-tight">{match.name || "Neznano"}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">
                                {match.tagsSelf ? match.tagsSelf.split(',')[0] : "Uporabnik"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                        {match.mutualTags > 0 && (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">
                                {match.mutualTags} skupnih točk
                            </span>
                        )}
                        {/* Tags preview */}
                        {(match.tagsSelf || "").split(',').slice(0, 2).map((tag: string) => (
                            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <Link
                        href={`/messages/${match.id}`}
                        className="w-full block bg-gray-900 text-white text-center py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600"
                    >
                        <MessageCircle size={18} /> Piši sporočilo
                    </Link>
                </div>
            ))}
        </div>
    );
}
