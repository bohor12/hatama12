"use client";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { ArrowLeft, X, Check } from "lucide-react";
import TinderCard from 'react-tinder-card';

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

export default function Browse() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Refs for card actions
    const childRefs = useMemo(() => Array(users.length).fill(0).map(i => React.createRef<any>()), [users.length]);

    useEffect(() => {
        fetch("/api/users/browse")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                    setCurrentIndex(data.length - 1);
                }
                setLoading(false);
            });
    }, []);

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
            alert(data.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
                <h1 className="text-xl font-bold">Iskanje</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
                {loading ? <p>Nalaganje...</p> : users.length > 0 ? (
                    <div className="w-full max-w-sm h-[70vh] relative">
                        {users.map((user, index) => {
                            const userPhotos = parsePhotos(user.photos);
                            const mainPhoto = userPhotos.length > 0 ? userPhotos[0] : '/placeholder.png';
                            
                            return (
                                <TinderCard
                                    ref={childRefs[index]}
                                    className="absolute inset-0"
                                    key={user.id}
                                    onSwipe={(dir) => swiped(dir, user.id)}
                                    onCardLeftScreen={() => outOfFrame(user.id)}
                                    preventSwipe={['up', 'down']}
                                >
                                    <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden relative">
                                        <img src={mainPhoto} alt={user.name} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/70 to-transparent text-white">
                                            <h3 className="text-3xl font-bold">{user.name || "Uporabnik"}</h3>
                                            <p className="text-lg">{user.location || "Neznana lokacija"}</p>
                                        </div>
                                    </div>
                                </TinderCard>
                            )
                        })}
                    </div>
                ) : (
                    <p>Ni novih oseb. Poskusite kasneje!</p>
                )}

                {!loading && users.length > 0 && (
                    <div className="mt-8 flex items-center justify-center gap-8">
                        <button onClick={() => swipe('left')} className="p-5 bg-white rounded-full shadow-lg text-red-500 hover:bg-red-50 transition-transform transform hover:scale-110">
                            <X size={32} />
                        </button>
                        <button onClick={() => swipe('right')} className="p-5 bg-white rounded-full shadow-lg text-green-500 hover:bg-green-50 transition-transform transform hover:scale-110">
                            <Check size={32} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
