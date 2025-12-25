"use client";
import React, { useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import SloveniaMap from '../map/SloveniaMap'; // Reuse the map component

interface SearchFiltersProps {
    onApply: (filters: any) => void;
    currentFilters: any;
}

export default function SearchFilters({ onApply, currentFilters }: SearchFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Local state for filters
    const [ageMin, setAgeMin] = useState(currentFilters.ageMin || 18);
    const [ageMax, setAgeMax] = useState(currentFilters.ageMax || 99);
    const [region, setRegion] = useState(currentFilters.region || null);
    const [heightMin, setHeightMin] = useState(currentFilters.heightMin || 150);
    const [hasPhoto, setHasPhoto] = useState(currentFilters.hasPhoto || false);

    const handleApply = () => {
        onApply({ ageMin, ageMax, region, heightMin, hasPhoto });
        setIsOpen(false);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transiton flex items-center gap-2 font-bold"
            >
                <Filter size={20} /> Filtri
            </button>

            {/* Modal / Sidebar */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Napredno Iskanje 🔍</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                        </div>

                        <div className="space-y-8 flex-1">
                            {/* Age Range */}
                            <section>
                                <h3 className="font-bold text-gray-700 mb-3 block">Starost: {ageMin} - {ageMax}</h3>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="range" min="18" max="99"
                                        value={ageMin} onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax))}
                                        className="w-full accent-black"
                                    />
                                    <input
                                        type="range" min="18" max="99"
                                        value={ageMax} onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin))}
                                        className="w-full accent-black"
                                    />
                                </div>
                            </section>

                            {/* Height */}
                            <section>
                                <h3 className="font-bold text-gray-700 mb-3 block">Najmanjša Višina: {heightMin} cm</h3>
                                <input
                                    type="range" min="140" max="220"
                                    value={heightMin} onChange={(e) => setHeightMin(Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </section>

                            {/* Region using existing Map */}
                            <section>
                                <label className="font-bold text-gray-700 mb-3 block">Regija (Map)</label>
                                <SloveniaMap selectedRegion={region} onSelectRegion={setRegion} />
                                {region && (
                                    <button
                                        onClick={() => setRegion(null)}
                                        className="mt-2 text-xs text-red-500 hover:underline"
                                    >
                                        Počisti regijo (Prikaži vso Slovenijo)
                                    </button>
                                )}
                            </section>

                            {/* Other Filters */}
                            <section className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="font-bold text-gray-700">Samo s sliko? 📸</span>
                                <div
                                    onClick={() => setHasPhoto(!hasPhoto)}
                                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${hasPhoto ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${hasPhoto ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </section>
                        </div>

                        <div className="mt-8 pt-4 border-t sticky bottom-0 bg-white">
                            <button
                                onClick={handleApply}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
                            >
                                <Check /> Uporabi Filtre
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
