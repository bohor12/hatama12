"use client";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef, createRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
        console.log('removing: ' + userId);
        if (direction === 'right') {
            sendInterest(userId);
        }
    };

    const outOfFrame = (userId: string) => {
        console.log(userId + ' left the screen!');
    };

    const swipe = async (dir: 'left' | 'right') => {
        if (currentIndex >= 0 && currentIndex < users.length && childRefs[currentIndex].current) {
            await childRefs[currentIndex].current.swipe(dir);
            setCurrentIndex(prevIndex => prevIndex - 1); // Decrement index after swipe
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
        } else {
           // silently fail or log?
           console.log(data.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="mb-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {genderParam === 'M' ? 'Moški' : genderParam === 'F' ? 'Ženske' : 'Vsi Uporabniki'}
                    </h1>
                    <p className="text-gray-500 text-sm">Povleci desno za všečkanje!</p>
                </div>

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
                                    <div className="w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden relative border border-gray-200">
                                        <img src={mainPhoto} alt={user.name} className="w-full h-full object-cover pointer-events-none" />

                                        {/* Overlay Gradient */}
                                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/60 to-transparent text-white">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-3xl font-bold flex items-end gap-2">
                                                        {user.name || "Uporabnik"}
                                                        <span className="text-xl font-normal opacity-90">{user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : ""}</span>
                                                    </h3>
                                                    <p className="text-lg opacity-90">{user.location || "Slovenija"}</p>
                                                </div>

                                                {/* Info Button to go to details */}
                                                <Link
                                                    href={`/users/${user.id}`}
                                                    className="mb-1 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition"
                                                    onPointerDown={(e) => e.stopPropagation()} // Prevent swipe start
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
                    <div className="text-center p-10 bg-white rounded-2xl shadow-sm">
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

                        {/* Middle button to view profile (alternative to info icon) */}
                        {currentIndex >= 0 && currentIndex < users.length && (
                             <Link href={`/users/${users[currentIndex].id}`} className="p-3 bg-white rounded-full shadow-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition">
                                <Info size={24} />
                            </Link>
                        )}

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