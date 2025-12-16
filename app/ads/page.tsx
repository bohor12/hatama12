"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, MapPin, Tag } from "lucide-react";

const CONTACT_TYPES = [
    "Seks za eno noč",
    "Prijateljstvo",
    "Reden seks",
    "Resna zveza",
    "Samo klepet",
    "Drugo"
];

export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", location: "", contactType: "Seks za eno noč" });

  useEffect(() => {
    fetch("/api/ads").then(res => res.json()).then(data => {
        if(Array.isArray(data)) setAds(data);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch("/api/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
      });
      if (res.ok) {
          window.location.reload();
      } else {
          const err = await res.json();
          alert(err.error);
      }
  };

  const getBadgeColor = (type: string) => {
      switch(type) {
          case "Seks za eno noč": return "bg-red-100 text-red-800";
          case "Reden seks": return "bg-orange-100 text-orange-800";
          case "Prijateljstvo": return "bg-green-100 text-green-800";
          case "Resna zveza": return "bg-blue-100 text-blue-800";
          default: return "bg-gray-100 text-gray-800";
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Oglasi</h1>
        </div>
        <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition active:scale-95"
        >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Nov Oglas</span>
        </button>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
          
        {showCreate && (
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-purple-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-gray-800">Ustvari Nov Oglas</h3>
                    <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">Prekliči</button>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Naslov</label>
                        <input
                            type="text"
                            placeholder="Npr. Iščem soplesalko za tečaj"
                            className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kaj iščeš?</label>
                            <select
                                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                value={formData.contactType}
                                onChange={e => setFormData({...formData, contactType: e.target.value})}
                            >
                                {CONTACT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
                            <input
                                type="text"
                                placeholder="Npr. Ljubljana"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vsebina</label>
                        <textarea
                            placeholder="Opiši podrobneje..."
                            className="w-full border border-gray-200 p-3 rounded-xl min-h-[120px] focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition shadow-md active:scale-[0.99]">
                        Objavi Oglas
                    </button>
                </form>
            </div>
        )}

        <div className="space-y-6">
            {ads.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>Trenutno ni aktivnih oglasov.</p>
                </div>
            ) : (
                ads.map(ad => (
                    <div key={ad.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200 group">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-3">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition">{ad.title}</h3>
                            {ad.contactType && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start whitespace-nowrap ${getBadgeColor(ad.contactType)}`}>
                                    {ad.contactType}
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 mb-5 leading-relaxed whitespace-pre-wrap">{ad.content}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-4 items-center">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${ad.user?.gender === 'M' ? 'bg-blue-400' : 'bg-pink-400'}`}></div>
                                <span className="font-medium text-gray-700">{ad.user?.name || "Uporabnik"}</span>
                            </div>

                            {ad.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{ad.location}</span>
                                </div>
                            )}

                            <div className="ml-auto text-xs text-gray-400">
                                {new Date(ad.createdAt).toLocaleDateString('sl-SI')}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
}
