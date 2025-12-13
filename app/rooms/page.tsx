"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Rooms() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
        <h1 className="text-xl font-bold">Javne Sobe</h1>
      </header>

      <main className="container mx-auto px-4 py-6">
        <p className="text-center text-gray-500 mb-8">Pridružite se debati v eni izmed javnih sob.</p>
        
        <div className="space-y-4">
            {/* Hardcoded rooms for MVP */}
            {["Splošna Debata", "Ljubljana", "Maribor", "Hobiji & Šport", "Zmenki Nasveti"].map((room, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition">
                    <div>
                        <h3 className="font-bold text-lg">{room}</h3>
                        <p className="text-sm text-gray-500">Klikni za vstop...</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
