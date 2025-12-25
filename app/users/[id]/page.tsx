"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, MessageCircle, MapPin, Calendar, Heart } from "lucide-react";
import Navbar from "../../components/Navbar";

// Helper to parse photos JSON safely
const parseJSON = (jsonString: string | null) => {
    try {
        if (jsonString) {
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error("Failed to parse JSON:", e);
    }
    return [];
};

const RELATIONSHIP_LABELS: Record<string, string> = {
    "Sex": "Seks",
    "Dates": "Zmenki",
    "Friends": "Prijatelji",
    "LongTerm": "Resna zveza"
};

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const unwrappedParams = React.use(params);
    const userId = unwrappedParams.id;

    useEffect(() => {
        setLoading(true);
        fetch(`/api/users/${userId}`)
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Napaka pri nalaganju uporabnika.");
                }
                return res.json();
            })
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [userId]);

    const handleAction = async (action: 'like' | 'pass') => {
        // Implement interaction logic if needed, or just redirect
        // For public profile, maybe we just show status?
        // But users might want to Like from here.
        if (action === 'like') {
            await fetch("/api/interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId })
            });
            alert("Poslano zanimanje!");
        }
        router.back();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-pink-600 font-semibold animate-pulse">Nalaganje profila...</div>
        </div>
    );

    if (error || !user) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-red-500 font-bold mb-4">{error || "Uporabnik ni bil najden."}</div>
            <button onClick={() => router.back()} className="text-blue-600 hover:underline">Nazaj</button>
        </div>
    );

    const photos = parseJSON(user.photos);
    const personalTraits = parseJSON(user.personalTraits);
    const partnerTraits = parseJSON(user.partnerTraits);
    const interests = parseJSON(user.interests);
    const relationshipTypes = parseJSON(user.relationshipTypes);

    const age = user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            
            <main className="max-w-2xl mx-auto pt-6 px-4">
                <button 
                    onClick={() => router.back()} 
                    className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Nazaj
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Photo Gallery */}
                    <div className="relative aspect-[3/4] sm:aspect-video w-full bg-gray-100">
                        {photos.length > 0 ? (
                            <img 
                                src={photos[currentPhotoIndex]} 
                                alt={user.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                Brez fotografije
                            </div>
                        )}
                        
                        {/* Photo Indicators */}
                        {photos.length > 1 && (
                            <div className="absolute top-4 left-0 w-full px-4 flex gap-1">
                                {photos.map((_, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setCurrentPhotoIndex(idx)}
                                        className={`h-1 flex-1 rounded-full transition-all ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Navigation Areas */}
                        {photos.length > 1 && (
                            <>
                                <div 
                                    className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer" 
                                    onClick={() => setCurrentPhotoIndex(prev => Math.max(0, prev - 1))} 
                                />
                                <div 
                                    className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer" 
                                    onClick={() => setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))} 
                                />
                            </>
                        )}

                        {/* Bottom Overlay Gradient */}
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        
                        <div className="absolute bottom-6 left-6 text-white z-20">
                            <h1 className="text-4xl font-bold flex items-end gap-3">
                                {user.name} 
                                <span className="text-2xl font-normal opacity-90">{age}</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-2 text-lg opacity-90">
                                <MapPin size={18} />
                                <span>{user.location || "Slovenija"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-8 space-y-8">
                        
                        {/* Action Buttons */}
                        {user.interaction?.canMessage ? (
                            <Link href={`/messages/chat/${user.id}`} className="block w-full py-4 bg-blue-600 text-white text-center rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                <MessageCircle />
                                Pošlji Sporočilo
                            </Link>
                        ) : (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => handleAction('pass')}
                                    className="flex-1 py-4 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                >
                                    <X />
                                    Ni zame
                                </button>
                                <button 
                                    onClick={() => handleAction('like')}
                                    className="flex-1 py-4 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
                                >
                                    <Check />
                                    Všeč mi je
                                </button>
                            </div>
                        )}

                        {/* Basic Stats */}
                        <div className="grid grid-cols-2 gap-4 text-gray-700">
                             {user.height && (
                                 <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                     <span className="text-2xl">📏</span>
                                     <div>
                                         <p className="text-xs text-gray-500 font-bold uppercase">Višina</p>
                                         <p className="font-semibold">{user.height} cm</p>
                                     </div>
                                 </div>
                             )}
                             <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                 <span className="text-2xl">🚬</span>
                                 <div>
                                     <p className="text-xs text-gray-500 font-bold uppercase">Kajenje</p>
                                     <p className="font-semibold">{user.isSmoker ? "Da" : "Ne"}</p>
                                 </div>
                             </div>
                             {user.voiceCallAllowed && (
                                 <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                     <span className="text-2xl">📞</span>
                                     <div>
                                         <p className="text-xs text-gray-500 font-bold uppercase">Klici</p>
                                         <p className="font-semibold">Dovoljeni</p>
                                     </div>
                                 </div>
                             )}
                        </div>

                        {/* About Me Traits */}
                        {personalTraits.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                    O Meni
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {personalTraits.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Looking For Traits */}
                        {partnerTraits.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                                    Koga Iščem
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {partnerTraits.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Interests */}
                        {interests.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                    Zanimanja
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {interests.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Relationship Types */}
                        {relationshipTypes.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                    Iščem
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {relationshipTypes.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                            {RELATIONSHIP_LABELS[t] || t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
