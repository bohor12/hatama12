"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Inbox, Users } from "lucide-react";
import FadeIn from "../components/ui/FadeIn";

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<'PRIMARY' | 'OTHERS'>('PRIMARY');
  const [othersCount, setOthersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/conversations?folder=${activeFolder}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) {
          setConversations(data.conversations);
          setOthersCount(data.othersCount || 0);
        }
        setLoading(false);
      });
  }, [activeFolder]);

  // Parse photos helper
  const getPhoto = (photos: string | null) => {
    try {
      if (photos) {
        const parsed = JSON.parse(photos);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
      }
    } catch { }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-600 hover:text-pink-600 transition">
          <ArrowLeft />
        </Link>
        <h1 className="text-xl font-bold text-gray-800">Sporočila</h1>
      </header>

      {/* Folder Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[60px] z-10">
        <div className="container mx-auto flex">
          <button
            onClick={() => setActiveFolder('PRIMARY')}
            className={`flex-1 py-4 text-center font-bold border-b-2 transition flex items-center justify-center gap-2 ${activeFolder === 'PRIMARY'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Inbox size={18} /> Glavna Mapa
          </button>
          <button
            onClick={() => setActiveFolder('OTHERS')}
            className={`flex-1 py-4 text-center font-bold border-b-2 transition flex items-center justify-center gap-2 relative ${activeFolder === 'OTHERS'
                ? 'border-gray-600 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <Users size={18} /> Ostala
            {othersCount > 0 && activeFolder === 'PRIMARY' && (
              <span className="absolute top-2 right-4 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {othersCount > 9 ? '9+' : othersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Info Banner for Others Folder */}
        {activeFolder === 'OTHERS' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-4 text-sm">
            <strong>💌 Ostala sporočila:</strong> Tu so sporočila od oseb, ki jih še niste odobrili.
            Če želite odgovoriti, jih najprej dodajte med potrjene kontakte.
          </div>
        )}

        <FadeIn className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Nalagam...</div>
          ) : conversations.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
              {activeFolder === 'PRIMARY' ? (
                <>
                  <p className="font-medium">Nimate še nobenih pogovorov.</p>
                  <p className="text-sm mt-2">Potrdite zanimanja ali počakajte na odgovor.</p>
                </>
              ) : (
                <>
                  <p className="font-medium">Ni novih sporočil v mapi "Ostala".</p>
                  <p className="text-sm mt-2">Sporočila od novih oseb se pojavijo tukaj.</p>
                </>
              )}
            </div>
          ) : (
            conversations.map((user) => {
              const photo = getPhoto(user.photos);
              return (
                <Link
                  key={user.id}
                  href={`/messages/chat/${user.id}`}
                  className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {photo ? (
                      <img src={photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{user.name || "Uporabnik"}</h3>
                      {user.isVerified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.lastMessage || "Klikni za pogovor..."}</p>
                  </div>
                  {user.unread > 0 && (
                    <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {user.unread}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </FadeIn>
      </main>
    </div>
  );
}
