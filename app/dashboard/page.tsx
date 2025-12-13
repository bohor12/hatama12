"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Search, MessageCircle, FileText, User, Users } from "lucide-react";

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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Heart className="text-pink-600 w-6 h-6 fill-current" />
                <span className="text-xl font-bold text-gray-900">SloZmenki</span>
            </div>
            <div className="flex gap-4">
                <Link href="/profile" className="text-gray-600 hover:text-pink-600"><User /></Link>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Pozdravljeni, {user?.name || "uporabnik"}!</h1>
        <p className="text-gray-500 mb-8">Kaj želite početi danes?</p>

        {/* Action Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Link href="/browse" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-center border border-gray-100">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600"><Search /></div>
                <span className="font-bold">Išči Osebe</span>
            </Link>
            <Link href="/ads" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-center border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><FileText /></div>
                <span className="font-bold">Oglasi</span>
            </Link>
            <Link href="/messages" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-center border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><MessageCircle /></div>
                <span className="font-bold">Sporočila</span>
            </Link>
             <Link href="/rooms" className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-center border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Users /></div>
                <span className="font-bold">Sobe</span>
            </Link>
        </div>

        {/* Incoming Interests (Only visible if any) */}
        {interests.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-pink-500 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Heart className="text-pink-600 fill-current w-5 h-5" />
                    Nova Zanimanja ({interests.length})
                </h2>
                <div className="space-y-4">
                    {interests.map((interest) => (
                        <div key={interest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-bold">{interest.sender.name || "Neznanec"}</p>
                                <p className="text-xs text-gray-500">Višina: {interest.sender.height || "?"} cm</p>
                            </div>
                            <button 
                                onClick={() => handleApprove(interest.id)}
                                className="px-4 py-2 bg-pink-600 text-white text-sm font-bold rounded-full hover:bg-pink-700 transition"
                            >
                                Odobri & Klepetaj
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
