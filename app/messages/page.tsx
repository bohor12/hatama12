"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

export default function Messages() {
  // Simplification for MVP: Just list messages or a "Mock" chat interface
  // Real implementation requires WebSocket or polling.
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
        <h1 className="text-xl font-bold">Sporočila</h1>
      </header>

      <main className="container mx-auto px-4 py-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Vaši Pogovori</h2>
            <p className="text-gray-500">
                Tu se bodo prikazali pogovori z osebami, s katerimi ste se povezali (Zanimaš me &rarr; Odobreno).
            </p>
        </div>
      </main>
    </div>
  );
}
