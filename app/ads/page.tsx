"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Calendar, MapPin, Tag } from "lucide-react";

const CATEGORIES = [
    { id: "ALL", label: "Vse" },
    { id: "GENERAL", label: "Splošno" },
    { id: "DATE", label: "Zmenek" },
    { id: "DINNER", label: "Večerja" },
    { id: "MOVIE", label: "Kino" },
    { id: "ACTIVITY", label: "Aktivnost" },
    { id: "TRIP", label: "Izlet" }
];

export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [formData, setFormData] = useState({
      title: "",
      content: "",
      location: "",
      category: "GENERAL",
      eventDate: ""
  });

  useEffect(() => {
    let url = "/api/ads";
    if (selectedCategory !== "ALL") {
        url += `?category=${selectedCategory}`;
    }

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-pink-600 transition"><ArrowLeft /></Link>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Ideje in Zmenki</h1>
            </div>
            <button
                onClick={() => setShowCreate(!showCreate)}
                className={`p-2 rounded-full transition shadow-md ${showCreate ? 'bg-gray-200 text-gray-700' : 'bg-pink-600 text-white hover:bg-pink-700'}`}
            >
                <Plus />
            </button>
          </div>

          {/* Categories Scroll */}
          <div className="flex overflow-x-auto px-4 pb-3 gap-2 no-scrollbar">
              {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${
                        selectedCategory === cat.id
                            ? "bg-gray-800 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                      {cat.label}
                  </button>
              ))}
          </div>
      </header>

      <main className="container mx-auto px-4 py-6">
          
        {showCreate && (
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-pink-100 animate-in fade-in slide-in-from-top-4">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Nov Predlog</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="w-full border p-3 rounded-xl bg-gray-50"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            {CATEGORIES.filter(c => c.id !== "ALL").map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            className="w-full border p-3 rounded-xl bg-gray-50 text-gray-600"
                            value={formData.eventDate}
                            onChange={e => setFormData({...formData, eventDate: e.target.value})}
                        />
                    </div>

                    <input 
                        type="text" placeholder="Naslov (npr. Večerja v mestu)"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />
                    <textarea 
                        placeholder="Opiši svojo idejo..."
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none min-h-[100px]"
                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                        required
                    />
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text" placeholder="Lokacija (Ljubljana, Maribor...)"
                            className="w-full border p-3 pl-10 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="w-full bg-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-pink-700 transition">Objavi</button>
                </form>
            </div>
        )}

        {ads.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
                <p>Ni oglasov v tej kategoriji.</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 gap-4">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                        {CATEGORIES.find(c => c.id === ad.category)?.label || "Splošno"}
                                    </span>
                                    {ad.eventDate && (
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(ad.eventDate).toLocaleDateString()} {new Date(ad.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-pink-600 transition">{ad.title}</h3>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{ad.content}</p>

                        <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3 mt-auto">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${ad.user?.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                                <span className="font-medium">{ad.user?.name || "Uporabnik"}</span>
                            </div>
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {ad.location || "Slovenija"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}
