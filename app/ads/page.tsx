"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Calendar, MapPin, Coffee, Utensils, Film, Activity, CheckCircle } from "lucide-react";

export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
      title: "",
      content: "",
      location: "",
      category: "GENERAL",
      eventDate: ""
  });

  const categories = [
      { id: "GENERAL", label: "Splošno", icon: <Activity size={18} /> },
      { id: "DATE", label: "Zmenek", icon: <Coffee size={18} /> },
      { id: "DINNER", label: "Večerja", icon: <Utensils size={18} /> },
      { id: "MOVIE", label: "Kino", icon: <Film size={18} /> },
      { id: "ACTIVITY", label: "Aktivnost", icon: <Activity size={18} /> },
  ];

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
          alert(err.error || "Napaka pri objavi");
      }
  };

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case "DATE": return <Coffee className="text-pink-500" />;
          case "DINNER": return <Utensils className="text-orange-500" />;
          case "MOVIE": return <Film className="text-blue-500" />;
          case "ACTIVITY": return <Activity className="text-green-500" />;
          default: return <Activity className="text-gray-400" />;
      }
  };

  const getCategoryLabel = (cat: string) => {
      const c = categories.find(x => x.id === cat);
      return c ? c.label : "Splošno";
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"><ArrowLeft /></Link>
            <div>
                <h1 className="text-xl font-bold text-gray-800">Vabila & Oglasi</h1>
                <p className="text-xs text-gray-500">Povabi nekoga na zmenek!</p>
            </div>
        </div>
        <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 shadow-lg transition transform hover:scale-105"
        >
            <Plus />
        </button>
      </header>

      <main className="container mx-auto px-4 py-6">

        {showCreate && (
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-pink-100 animate-fade-in-down">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800">Ustvari Novo Vabilo</h3>
                    <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">Prekliči</button>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">

                    {/* Category Selection */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setFormData({...formData, category: cat.id})}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${formData.category === cat.id ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className="mb-1">{cat.icon}</div>
                                <span className="text-xs font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <input
                        type="text" placeholder="Naslov (npr. Dve karti za kino...)"
                        className="w-full border-gray-200 bg-gray-50 p-4 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />

                    <textarea
                        placeholder="Več informacij..."
                        className="w-full border-gray-200 bg-gray-50 p-4 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none h-32 resize-none"
                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="text" placeholder="Lokacija"
                                className="w-full pl-10 border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="datetime-local"
                                className="w-full pl-10 border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-gray-600"
                                value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-pink-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-pink-700 hover:shadow-lg transition">Objavi Vabilo</button>
                </form>
            </div>
        )}

        <div className="space-y-4">
            {ads.length === 0 && !showCreate && (
                <div className="text-center py-20 text-gray-400">
                    <p>Trenutno ni aktivnih vabil.</p>
                    <p>Bodi prvi in objavi nekaj!</p>
                </div>
            )}

            {ads.map(ad => (
                <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {getCategoryIcon(ad.category)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{ad.title}</h3>
                                    <span className="text-xs text-pink-600 font-medium uppercase tracking-wider">{getCategoryLabel(ad.category)}</span>
                                </div>
                            </div>
                            {ad.eventDate && (
                                <div className="text-right bg-pink-50 px-3 py-1 rounded-lg">
                                    <p className="text-xs text-pink-800 font-bold uppercase">{new Date(ad.eventDate).toLocaleDateString('sl-SI', { weekday: 'short' })}</p>
                                    <p className="text-lg font-bold text-pink-600 leading-none">{new Date(ad.eventDate).getDate()}</p>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{ad.content}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            {ad.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    <span>{ad.location}</span>
                                </div>
                            )}
                            {ad.eventDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{new Date(ad.eventDate).toLocaleTimeString('sl-SI', {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                                    {ad.user?.name || "Uporabnik"}
                                    {ad.user?.isVerified && <CheckCircle size={14} className="text-blue-500 fill-blue-50" />}
                                </span>
                                <span className="text-xs text-gray-500">{ad.user?.gender === 'M' ? 'Moški' : 'Ženska'}</span>
                            </div>
                        </div>
                        <button className="text-sm bg-white border border-pink-200 text-pink-600 px-4 py-2 rounded-full font-medium hover:bg-pink-50 transition">
                            Pošlji sporočilo
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
