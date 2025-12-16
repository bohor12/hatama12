"use client";
import Link from "next/link";
import { useEffect, useState, useMemo, createRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, Check, Info } from "lucide-react";
import TinderCard from 'react-tinder-card';
import Navbar from "../components/Navbar";

// Helper to parse photos JSON safely
const parsePhotos = (photos: string | null) => {
    try {
        if (photos) {
            const parsed = JSON.parse(photos);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        console.error("Failed to parse photos JSON:", e);
    }
    return [];
};

function BrowseContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const genderParam = searchParams.get('gender');

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Refs for card actions
    const childRefs = useMemo(() => Array(users.length).fill(0).map(i => createRef<any>()), [users.length]);

    useEffect(() => {
        let url = "/api/users/browse";
        if (genderParam) {
            url += `?gender=${genderParam}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                    setCurrentIndex(data.length - 1);
                }
                setLoading(false);
            });
    }, [genderParam]);

    const swiped = (direction: string, userId: string) => {
        if (direction === 'right') {
            sendInterest(userId);
        }
        // Update index logic if needed, but react-tinder-card handles removal visually.
    };

    const outOfFrame = (userId: string) => {
        // Handle when card leaves screen
    };

    const swipe = async (dir: 'left' | 'right') => {
        if (currentIndex >= 0 && currentIndex < users.length && childRefs[currentIndex].current) {
            await childRefs[currentIndex].current.swipe(dir);
            setCurrentIndex(prevIndex => prevIndex - 1);
        }
    };

    const sendInterest = async (receiverId: string) => {
        const res = await fetch("/api/interest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId })
        });
        const data = await res.json();
        if (res.ok) {
            if (data.match) {
                alert("🎉 It's a Match! 🎉");
            }
        }
    };

    const handleGenderChange = (gender: string | null) => {
        if (gender) {
            router.push(`/browse?gender=${gender}`);
        } else {
            router.push('/browse');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <div className="flex justify-center my-4 px-4">
                <div className="bg-white rounded-full p-1 shadow-sm flex border border-gray-200">
                    <button
                        onClick={() => handleGenderChange('M')}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition ${genderParam === 'M' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        Moški
                    </button>
                    <button
                        onClick={() => handleGenderChange('F')}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition ${genderParam === 'F' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-500 hover:text-pink-600'}`}
                    >
                        Ženske
                    </button>
                    <button
                        onClick={() => handleGenderChange(null)}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition ${!genderParam ? 'bg-gray-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Vsi
                    </button>
                </div>
            </div>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">

                {loading ? <p className="text-gray-500">Nalaganje...</p> : users.length > 0 ? (
                    <div className="w-full max-w-sm h-[65vh] relative">
                        {users.map((user, index) => {
                            const userPhotos = parsePhotos(user.photos);
                            const mainPhoto = userPhotos.length > 0 ? userPhotos[0] : '/placeholder.png';

                            return (
                                <TinderCard
                                    ref={childRefs[index]}
                                    className="absolute inset-0 z-10"
                                    key={user.id}
                                    onSwipe={(dir) => swiped(dir, user.id)}
                                    onCardLeftScreen={() => outOfFrame(user.id)}
                                    preventSwipe={['up', 'down']}
                                >
                                    <div className="w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden relative border border-gray-200 select-none cursor-grab active:cursor-grabbing">
                                        <img src={mainPhoto} alt={user.name} className="w-full h-full object-cover pointer-events-none" />

                                        {/* Overlay Gradient */}
                                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/60 to-transparent text-white">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-3xl font-bold flex items-end gap-2">
                                                        {user.name || "Uporabnik"}
                                                        <span className="text-xl font-normal opacity-90">{user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : ""}</span>
                                                    </h3>
                                                    <p className="text-lg opacity-90 flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                                                        {user.location || "Slovenija"}
                                                    </p>
                                                </div>

                                                {/* Info Button to go to details */}
                                                <Link
                                                    href={`/users/${user.id}`}
                                                    className="mb-1 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition hover:scale-110"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                >
                                                    <Info size={24} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </TinderCard>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xl font-bold text-gray-800 mb-2">Ni več oseb.</p>
                        <p className="text-gray-500 mb-4">Poskusite spremeniti iskanje ali pridite nazaj kasneje.</p>
                        <Link href="/dashboard" className="text-pink-600 font-bold hover:underline">Nazaj na domov</Link>
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <div className="mt-8 flex items-center justify-center gap-6 z-0">
                        <button onClick={() => swipe('left')} className="p-4 bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-transform transform hover:scale-110 border border-red-100">
                            <X size={32} />
                        </button>

                        <button onClick={() => swipe('right')} className="p-4 bg-white rounded-full shadow-lg text-green-500 hover:bg-green-50 transition-transform transform hover:scale-110 border border-green-100">
                            <Check size={32} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function Browse() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Nalaganje...</div>}>
            <BrowseContent />
        </Suspense>
    );
}
