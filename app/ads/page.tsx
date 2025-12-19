"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", location: "", category: "GENERAL", eventDate: "" });
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const url = selectedCategory === "ALL" ? "/api/ads" : `/api/ads?category=${selectedCategory}`;
    fetch(url).then(res => res.json()).then(data => {
        if(Array.isArray(data)) setAds(data);
    });
  }, [selectedCategory]);

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

  const CATEGORIES = [
      { id: "GENERAL", label: "Splošno", icon: "📌" },
      { id: "DATE", label: "Zmenek", icon: "🌹" },
      { id: "DINNER", label: "Večerja", icon: "🍽️" },
      { id: "MOVIE", label: "Kino", icon: "🍿" },
      { id: "ACTIVITY", label: "Aktivnost", icon: "🏂" },
      { id: "TRIP", label: "Izlet", icon: "🚗" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
                <h1 className="text-xl font-bold">Ideje & Zmenki</h1>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700">
                <Plus />
            </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${selectedCategory === "ALL" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
                Vse
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${selectedCategory === cat.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                    {cat.icon} {cat.label}
                </button>
            ))}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
          
        {showCreate && (
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-purple-100">
                <h3 className="font-bold text-lg mb-4">Nov Predlog / Zmenek</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-500 mb-1 block">Kategorija</label>
                        <select
                            className="w-full border p-3 rounded-xl bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                        </select>
                    </div>

                    <input 
                        type="text" placeholder="Naslov (npr. Gremo v kino?)"
                        className="w-full border p-3 rounded-xl"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />

                    <textarea 
                        placeholder="Opis dogodka..."
                        className="w-full border p-3 rounded-xl"
                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text" placeholder="Lokacija"
                            className="w-full border p-3 rounded-xl"
                            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                        <input
                            type="datetime-local"
                            className="w-full border p-3 rounded-xl"
                            value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl">Objavi</button>
                </form>
            </div>
        )}

        <div className="space-y-4">
            {ads.map(ad => {
                const category = CATEGORIES.find(c => c.id === ad.category) || CATEGORIES[0];
                return (
                    <div key={ad.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl" role="img" aria-label={category.label}>{category.icon}</span>
                                <div>
                                    <h3 className="font-bold text-lg text-purple-900 leading-tight">{ad.title}</h3>
                                    <span className="text-xs text-gray-400">{new Date(ad.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {ad.eventDate && (
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                    🗓 {new Date(ad.eventDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 mb-4 mt-2">{ad.content}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                            <span className="font-medium text-gray-700">{ad.user?.name || "Uporabnik"}</span>
                            <span>📍 {ad.location || "Online"}</span>
                        </div>
                    </div>
                );
            })}
        </div>
      </main>
    </div>
  );
}
