"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Search, MessageCircle, FileText, Users } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [interests, setInterests] = useState<any[]>([]);

  useEffect(() => {
     // Fetch User
     fetch("/api/user/me").then(res => {
         if(res.status === 401) router.push("/login");
         return res.json();
     }).then(data => setUser(data));

     // Fetch Incoming Interests
     fetch("/api/interest").then(res => res.json()).then(data => {
         if(Array.isArray(data)) setInterests(data);
     });
  }, [router]);

  const handleApprove = async (interestId: string) => {
      await fetch("/api/interest/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interestId })
      });
      alert("Odobreno! Zdaj si lahko pišeta.");
      // Refresh list
      setInterests(prev => prev.filter(i => i.id !== interestId));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pozdravljeni, {user?.name || "uporabnik"}! 👋</h1>
            <p className="text-gray-500 text-lg">Kaj želite početi danes?</p>
        </div>

        {/* Primary Actions - Gender Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Link href="/browse?gender=F" className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-400 p-8 rounded-3xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-white text-center">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Heart size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                         <Search size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Išči Ženske</h2>
                    <p className="opacity-90">Spoznaj simpatične dame v tvoji bližini</p>
                </div>
            </Link>

            <Link href="/browse?gender=M" className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-400 p-8 rounded-3xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 text-white text-center">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Search size={120} />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                         <Search size={32} />
                    </div>
                    <h2 className="text-2xl font-bold">Išči Moške</h2>
                    <p className="opacity-90">Spoznaj zanimive moške v tvoji bližini</p>
                </div>
            </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-4 mb-12">
            <Link href="/messages" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 text-center border border-gray-100 group">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                    <MessageCircle size={24} />
                </div>
                <span className="font-semibold text-gray-700">Sporočila</span>
            </Link>
            <Link href="/rooms" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 text-center border border-gray-100 group">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                    <Users size={24} />
                </div>
                <span className="font-semibold text-gray-700">Sobe</span>
            </Link>
             <Link href="/ads" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-2 text-center border border-gray-100 group">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                    <FileText size={24} />
                </div>
                <span className="font-semibold text-gray-700">Oglasi</span>
            </Link>
        </div>

        {/* Incoming Interests (Only visible if any) */}
        {interests.length > 0 && (
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-pink-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <Heart className="text-pink-600 fill-current w-6 h-6 animate-pulse" />
                    Nova Zanimanja <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{interests.length}</span>
                </h2>
                <div className="space-y-3">
                    {interests.map((interest) => (
                        <div key={interest.id} className="flex items-center justify-between p-4 bg-pink-50/50 rounded-2xl hover:bg-pink-50 transition">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                     {/* Placeholder avatar */}
                                     <div className="w-full h-full bg-gray-300"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{interest.sender.name || "Neznanec"}</p>
                                    <p className="text-xs text-gray-500">{interest.sender.location || "Slovenija"}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleApprove(interest.id)}
                                className="px-5 py-2.5 bg-pink-600 text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition shadow-md shadow-pink-200"
                            >
                                Odobri
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
