"use client";
import React, { useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Heart, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamically import TinderCard to avoid SSR issues with touch events
const TinderCard = dynamic(() => import('react-tinder-card'), { ssr: false });

const db = [
    {
        name: 'Ana, 24',
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
        bio: 'Ljubiteljica narave in dobre hrane. 🥗'
    },
    {
        name: 'Maja, 27',
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
        bio: 'Iščem avanturo... in nekoga, ki zna plesati. 💃'
    },
    {
        name: 'Nina, 22',
        url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
        bio: 'Študentka medicine. Rada potujem. ✈️'
    },
    {
        name: 'Klara, 25',
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=500&q=80',
        bio: 'Samo sproščeno. 🥂'
    }
];

export default function SwipePage() {
    const [lastDirection, setLastDirection] = useState<string>();
    const [currentIndex, setCurrentIndex] = useState(db.length - 1);
    const currentIndexRef = useRef(currentIndex);

    const childRefs = useMemo(
        () => Array(db.length).fill(0).map((i) => React.createRef()),
        []
    );

    const updateCurrentIndex = (val: number) => {
        setCurrentIndex(val);
        currentIndexRef.current = val;
    };

    const canSwipe = currentIndex >= 0;

    const swiped = (direction: string, nameToDelete: string, index: number) => {
        setLastDirection(direction);
        updateCurrentIndex(index - 1);
    };

    const outOfFrame = (name: string, idx: number) => {
        // handle the case in which go back is pressed before card goes outOfFrame
        currentIndexRef.current >= idx && (childRefs[idx].current as any).restoreCard();
    };

    const swipe = async (dir: string) => {
        if (canSwipe && currentIndex < db.length) {
            await (childRefs[currentIndex].current as any).swipe(dir); // Swipe the card!
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <Link href="/dashboard" className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-white font-bold text-xl drop-shadow-md">Vroče ali Ne? 🔥</h1>
                <div className="w-10"></div>
            </header>

            <div className='flex flex-col items-center justify-center flex-1 relative mt-10'>
                <div className='relative w-[90vw] max-w-[400px] h-[600px]'>
                    {db.map((character, index) => (
                        <TinderCard
                            ref={childRefs[index] as any}
                            className='absolute w-full h-full'
                            key={character.name}
                            onSwipe={(dir) => swiped(dir, character.name, index)}
                            onCardLeftScreen={() => outOfFrame(character.name, index)}
                            preventSwipe={['up', 'down']}
                        >
                            <div
                                style={{ backgroundImage: 'url(' + character.url + ')' }}
                                className='relative w-full h-full bg-cover bg-center rounded-[20px] shadow-2xl flex flex-col justify-end p-6'
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-[20px]"></div>
                                <div className="relative z-10 text-white">
                                    <h3 className='text-3xl font-extrabold mb-2 text-shadow'>{character.name}</h3>
                                    <p className="text-lg opacity-90">{character.bio}</p>
                                </div>
                            </div>
                        </TinderCard>
                    ))}

                    {/* Empty State when no more cards */}
                    {currentIndex < 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-white/80 rounded-[20px]">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Ni več profilov! 🚀</h3>
                                <p className="text-gray-500">Pridi nazaj kasneje po več ujemanj.</p>
                                <Link href="/dashboard" className="mt-4 inline-block bg-pink-600 text-white px-6 py-2 rounded-full font-bold">Nazaj na Domov</Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Buttons - Now Functional for PC */}
                <div className="flex gap-8 mt-8 pb-10 z-10">
                    <button
                        onClick={() => swipe('left')}
                        className="bg-white p-5 rounded-full shadow-lg text-red-500 hover:scale-110 hover:bg-red-50 transition transform flex items-center justify-center border-2 border-red-100"
                    >
                        <X size={32} />
                    </button>
                    <button
                        onClick={() => swipe('right')}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 p-5 rounded-full shadow-lg text-white hover:scale-110 hover:shadow-pink-500/50 transition transform flex items-center justify-center border-2 border-pink-400"
                    >
                        <Heart size={32} fill="currentColor" />
                    </button>
                </div>

                {lastDirection && (
                    <h2 className='absolute top-20 text-gray-400 font-bold animate-pulse'>
                        {lastDirection === 'right' ? "Všeč ti je! 😍" : "Naslednja... 🙄"}
                    </h2>
                )}
            </div>
        </div>
    )
}
