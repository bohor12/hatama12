"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

export default function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", location: "" });

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
            <h1 className="text-xl font-bold">Oglasna Deska</h1>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700">
            <Plus />
        </button>
      </header>

      <main className="container mx-auto px-4 py-6">
          
        {showCreate && (
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-purple-100">
                <h3 className="font-bold text-lg mb-4">Nov Oglas</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <input 
                        type="text" placeholder="Naslov (npr. Iščem soplesalko)" 
                        className="w-full border p-3 rounded-xl"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        required
                    />
                    <textarea 
                        placeholder="Vsebina..." 
                        className="w-full border p-3 rounded-xl"
                        value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                        required
                    />
                    <input 
                        type="text" placeholder="Lokacija" 
                        className="w-full border p-3 rounded-xl"
                        value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl">Objavi Oglas</button>
                </form>
            </div>
        )}

        <div className="space-y-4">
            {ads.map(ad => (
                <div key={ad.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-purple-900">{ad.title}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{ad.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                        <span>{ad.user?.name || "Uporabnik"} ({ad.user?.gender === 'M' ? 'M' : 'Ž'})</span>
                        <span>{ad.location}</span>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
