"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";

export default function Browse() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/browse")
      .then(res => res.json())
      .then(data => {
          if (Array.isArray(data)) setUsers(data);
          setLoading(false);
      });
  }, []);

  const sendInterest = async (receiverId: string) => {
      const res = await fetch("/api/interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId })
      });
      const data = await res.json();
      if (res.ok) {
          alert("Zanimanje poslano! Počakajte na odobritev.");
      } else {
          alert(data.error);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
        <h1 className="text-xl font-bold">Iskanje Oseb</h1>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? <p className="text-center text-gray-500">Nalaganje profilov...</p> : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {users.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">
                        Ni najdenih oseb, ki ustrezajo vašim kriterijem (ali pa vi ne ustrezate njihovim!).
                    </p>
                ) : users.map(user => (
                    <div key={user.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                            {/* Placeholder for photo */}
                            <span className="text-4xl">📷</span>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold mb-1">{user.name || "Uporabnik"}</h3>
                            <div className="text-sm text-gray-500 mb-4 space-y-1">
                                <p>{user.gender === 'M' ? 'Moški' : 'Ženska'}</p>
                                <p>Višina: {user.height ? `${user.height} cm` : '?'}</p>
                                <p>{user.location || "Neznana lokacija"}</p>
                            </div>
                            
                            <button 
                                onClick={() => sendInterest(user.id)}
                                className="mt-auto w-full py-3 bg-pink-100 text-pink-700 font-bold rounded-xl hover:bg-pink-200 transition flex items-center justify-center gap-2"
                            >
                                <Heart className="w-5 h-5" />
                                Zanimaš me
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}
