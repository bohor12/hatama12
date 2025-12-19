"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Calendar, MapPin, Tag } from "lucide-react";

const CATEGORIES = [
  { value: "GENERAL", label: "Splošno" },
  { value: "DATE", label: "Zmenek" },
  { value: "DINNER", label: "Večerja" },
  { value: "MOVIE", label: "Kino" },
  { value: "ACTIVITY", label: "Aktivnost" },
  { value: "TRIP", label: "Izlet" }
];

export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    location: "",
    category: "GENERAL",
    eventDate: ""
  });

  useEffect(() => {
    fetch("/api/ads").then(res => res.json()).then(data => {
        if(Array.isArray(data)) {
            setAds(data);
            setFilteredAds(data);
        }
    });
  }, []);

  useEffect(() => {
      if (filterCategory === "ALL") {
          setFilteredAds(ads);
      } else {
          setFilteredAds(ads.filter(ad => ad.category === filterCategory));
      }
  }, [filterCategory, ads]);

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

  const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;
  const getCategoryColor = (cat: string) => {
      switch(cat) {
          case 'DATE': return 'bg-pink-100 text-pink-700';
          case 'DINNER': return 'bg-orange-100 text-orange-700';
          case 'TRIP': return 'bg-green-100 text-green-700';
          case 'MOVIE': return 'bg-blue-100 text-blue-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
                <h1 className="text-xl font-bold">Ideje in Zmenki</h1>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 shadow-md">
                <Plus />
            </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
                onClick={() => setFilterCategory("ALL")}
                className={`px-4 py-1 rounded-full text-sm whitespace-nowrap transition ${filterCategory === "ALL" ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
                Vse
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={`px-4 py-1 rounded-full text-sm whitespace-nowrap transition ${filterCategory === cat.value ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
          
        {showCreate && (
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-purple-100 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-lg mb-4 text-purple-900">Objavi Idejo ali Povabilo</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 ml-1">Kategorija</label>
                            <select
                                className="w-full border p-3 rounded-xl bg-gray-50"
                                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                            >
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 ml-1">Datum (opcijsko)</label>
                            <input
                                type="date"
                                className="w-full border p-3 rounded-xl bg-gray-50"
                                value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <input 
                        type="text" placeholder="Naslov (npr. Večerja v centru)"
                        className="w-full border p-3 rounded-xl"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />

                    <textarea 
                        placeholder="Opiši svojo idejo..."
                        className="w-full border p-3 rounded-xl min-h-[100px]"
                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                        required
                    />

                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text" placeholder="Lokacija (npr. Ljubljana)"
                            className="w-full border p-3 pl-10 rounded-xl"
                            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition">
                        Objavi
                    </button>
                </form>
            </div>
        )}

        <div className="space-y-4">
            {filteredAds.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>Ni objavljenih idej v tej kategoriji.</p>
                </div>
            )}

            {filteredAds.map(ad => (
                <div key={ad.id} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2 items-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getCategoryColor(ad.category)}`}>
                                {getCategoryLabel(ad.category || 'GENERAL')}
                            </span>
                            {ad.eventDate && (
                                <span className="flex items-center text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {new Date(ad.eventDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 mb-2">{ad.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{ad.content}</p>

                    <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                        <div className="flex items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] ${ad.user?.gender === 'M' ? 'bg-blue-400' : 'bg-pink-400'}`}>
                                {ad.user?.name ? ad.user.name[0].toUpperCase() : 'U'}
                            </div>
                            <span>{ad.user?.name || "Uporabnik"}</span>
                        </div>
                        {ad.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{ad.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
