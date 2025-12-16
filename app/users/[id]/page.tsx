"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { MessageCircle, Heart, MapPin, Ruler, Cigarette, Info, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper to parse photos
const parsePhotos = (photos: string | null) => {
    try {
        if (photos) {
            const parsed = JSON.parse(photos);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        // ignore
    }
    return [];
};

const parseTraits = (traits: string | null) => {
    try {
        if (traits) {
            const parsed = JSON.parse(traits);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        // ignore
    }
    return [];
};

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = use(params);
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [interaction, setInteraction] = useState<{status: string, canMessage: boolean}>({ status: 'NONE', canMessage: false });
    const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then(data => {
                setUser(data);
                if (data.interaction) {
                    setInteraction(data.interaction);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [userId]);

    const handleLike = async () => {
        try {
            const res = await fetch("/api/interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId })
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.match) {
                    alert("🎉 Ujemanje! Zdaj lahko pišete sporočila.");
                    setInteraction({ status: 'APPROVED', canMessage: true });
                } else {
                    setInteraction({ ...interaction, status: 'PENDING' });
                }
            } else {
                if (res.status === 401) router.push("/login");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleMessage = () => {
        router.push(`/messages/chat/${userId}`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Nalaganje...</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center">Uporabnik ne obstaja.</div>;

    const photos = parsePhotos(user.photos);
    const personalTraits = parseTraits(user.personalTraits);
    const partnerTraits = parseTraits(user.partnerTraits);

    const mainPhoto = photos.length > 0 ? photos[mainPhotoIndex] : '/placeholder.png';
    const age = user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : "?";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            
            <main className="max-w-4xl mx-auto p-4">
                <Link href="/browse" className="inline-flex items-center text-gray-500 hover:text-pink-600 mb-4 transition">
                    <ArrowLeft size={20} className="mr-1" /> Nazaj na iskanje
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Photos */}
                    <div className="relative h-[50vh] md:h-auto bg-black">
                        <img src={mainPhoto} alt={user.name} className="w-full h-full object-contain md:object-cover" />
                        
                        {/* Thumbnails */}
                        {photos.length > 1 && (
                            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 px-4 overflow-x-auto">
                                {photos.map((p: string, idx: number) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setMainPhotoIndex(idx)}
                                        className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition ${mainPhotoIndex === idx ? 'border-pink-500 scale-110' : 'border-white/50'}`}
                                    >
                                        <img src={p} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="p-8 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                        {user.name} <span className="text-xl text-gray-500 font-normal">{age}</span>
                                    </h1>
                                    <div className="flex items-center text-gray-500 mt-1">
                                        <MapPin size={16} className="mr-1" />
                                        {user.location || "Slovenija"}
                                    </div>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-100" />

                            <div className="space-y-4 text-gray-700">
                                {user.bio && (
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-1">O meni</h3>
                                        <p>{user.bio}</p>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {user.height && (
                                        <div className="flex items-center gap-2">
                                            <Ruler className="text-pink-500" size={20} />
                                            <span>{user.height} cm</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Cigarette className={user.isSmoker ? "text-gray-800" : "text-green-500"} size={20} />
                                        <span>{user.isSmoker ? "Kadilec" : "Nekadilec"}</span>
                                    </div>
                                </div>

                                {/* Traits Display */}
                                {(personalTraits.length > 0 || partnerTraits.length > 0) && (
                                    <div className="mt-6 space-y-4">
                                        {personalTraits.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-sm text-blue-600 uppercase tracking-wide mb-2">Kakšen/a sem</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {personalTraits.map((trait: string, i: number) => (
                                                        <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                                                            {trait}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {partnerTraits.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-sm text-pink-600 uppercase tracking-wide mb-2">Kaj me privlači</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {partnerTraits.map((trait: string, i: number) => (
                                                        <span key={i} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium border border-pink-200">
                                                            {trait}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user.lookingFor && (
                                     <div>
                                        <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wide mb-1 mt-4">Iščem</h3>
                                        <p>{user.lookingFor}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col gap-3">
                            {interaction.canMessage ? (
                                <button 
                                    onClick={handleMessage}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200"
                                >
                                    <MessageCircle size={24} />
                                    Pošlji Sporočilo
                                </button>
                            ) : interaction.status === 'PENDING' ? (
                                <button disabled className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                    <Check size={24} />
                                    Zanimanje Poslano
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleLike}
                                        className="flex-1 py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-pink-200"
                                    >
                                        <Heart size={24} className="fill-current" />
                                        Všečkaj
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
