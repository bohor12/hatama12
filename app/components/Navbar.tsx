"use client";
import Link from "next/link";
import { Home, Search, MessageCircle, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-pink-600">
            Hatapa
          </Link>
          
          <div className="flex gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
              <Home size={20} />
              <span className="hidden sm:inline">Domov</span>
            </Link>
            
            <Link href="/browse" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
              <Search size={20} />
              <span className="hidden sm:inline">Iskanje</span>
            </Link>
            
            <Link href="/messages" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
              <MessageCircle size={20} />
              <span className="hidden sm:inline">Sporočila</span>
            </Link>
            
            <Link href="/profile" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition">
              <User size={20} />
              <span className="hidden sm:inline">Profil</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
