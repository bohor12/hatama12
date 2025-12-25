"use client";

import React from 'react';
import { toast } from 'sonner';

interface SloveniaMapProps {
    selectedRegion: string | null;
    onSelectRegion: (region: string) => void;
}

// Simplified paths for regions (Conceptual representation for UI)
const REGIONS = [
    { id: "Osrednjeslovenska", color: "text-blue-500", label: "Ljubljana & Okolica" },
    { id: "Gorenjska", color: "text-cyan-500", label: "Gorenjska" },
    { id: "Savinjska", color: "text-green-500", label: "Štajerska (Celje)" },
    { id: "Podravska", color: "text-green-600", label: "Štajerska (Maribor)" },
    { id: "Obalno-kraška", color: "text-yellow-500", label: "Obala & Kras" },
    { id: "Jugovzhodna", color: "text-orange-500", label: "Dolenjska" },
    { id: "Pomurska", color: "text-purple-500", label: "Prekmurje" },
    { id: "Goriška", color: "text-yellow-600", label: "Goriška" },
    { id: "Koroška", color: "text-slate-500", label: "Koroška" },
    { id: "Zasavska", color: "text-red-500", label: "Zasavje" },
    { id: "Posavska", color: "text-orange-600", label: "Posavje" },
    { id: "Notranjska", color: "text-teal-600", label: "Notranjska" },
];

export default function SloveniaMap({ selectedRegion, onSelectRegion }: SloveniaMapProps) {
    return (
        <div className="w-full bg-white/50 rounded-3xl p-6 shadow-inner border border-white/20">
            <h4 className="font-bold text-gray-700 mb-4 text-center">Izberi svojo regijo 📍</h4>

            {/* 
               In a real production app, this would be an SVG map. 
               For this iteration, we use a stylish Grid/List selector that mimics a map layout or just a list 
               to ensure usability without complex SVG path debugging.
            */}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {REGIONS.map((region) => {
                    const isSelected = selectedRegion === region.id;
                    return (
                        <button
                            key={region.id}
                            onClick={() => onSelectRegion(region.id)}
                            className={`
                                relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group
                                ${isSelected
                                    ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200 scale-105 z-10'
                                    : 'bg-white border-gray-100 hover:border-pink-300 hover:shadow-md text-gray-600'
                                }
                            `}
                        >
                            <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isSelected ? 'text-pink-200' : 'text-gray-400'}`}>
                                {region.id}
                            </span>
                            <span className="font-bold text-sm block">
                                {region.label}
                            </span>

                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    📍
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
                *Tvoja natančna lokacija ne bo nikoli razkrita. Prikazana bo le regija.
            </p>
        </div>
    );
}
