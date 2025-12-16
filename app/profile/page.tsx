"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // Form States
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isSmoker, setIsSmoker] = useState(false);
  const [voiceCallAllowed, setVoiceCallAllowed] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Traits
  const [personalTraits, setPersonalTraits] = useState<string[]>(Array(5).fill(""));
  const [partnerTraits, setPartnerTraits] = useState<string[]>(Array(5).fill(""));


  // Filter States
  const [minHeight, setMinHeight] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [mustNotSmoke, setMustNotSmoke] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => {
          if (res.status === 401) {
              router.push("/login");
              return null;
          }
          return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name || "");
          setHeight(data.height || "");
          setBirthDate(data.birthDate ? data.birthDate.split('T')[0] : "");
          setIsSmoker(data.isSmoker || false);
          setVoiceCallAllowed(data.voiceCallAllowed || false);
          setPhotos(data.photos ? JSON.parse(data.photos) : []);
          
          const pTraits = data.personalTraits ? JSON.parse(data.personalTraits) : [];
          const partnerT = data.partnerTraits ? JSON.parse(data.partnerTraits) : [];

          // Ensure arrays are length 5
          const paddedPT = [...pTraits, ...Array(5).fill("")].slice(0, 5);
          const paddedPartner = [...partnerT, ...Array(5).fill("")].slice(0, 5);

          setPersonalTraits(paddedPT);
          setPartnerTraits(paddedPartner);

          if (data.filter) {
              setMinHeight(data.filter.minHeight || "");
              setMinAge(data.filter.minAge || "");
              setMaxAge(data.filter.maxAge || "");
              setMustNotSmoke(data.filter.mustNotSmoke || false);
          }
        }
        setLoading(false);
      });
  }, [router]);

  const handleSave = async () => {
      await fetch("/api/user/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              name,
              height,
              birthDate,
              isSmoker,
              voiceCallAllowed,
              personalTraits: personalTraits.filter(t => t.trim() !== ""),
              partnerTraits: partnerTraits.filter(t => t.trim() !== ""),
              filter: {
                  minHeight,
                  minAge,
                  maxAge,
                  mustNotSmoke
              }
          })
      });
      alert("Shranjeno!");
      router.push("/browse");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos(prev => [...prev, data.url]);
        alert("Fotografija uspešno naložena!");
      } else {
        alert("Napaka pri nalaganju fotografije.");
      }
    } catch (error) {
      console.error(error);
      alert("Napaka pri nalaganju fotografije.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (indexToRemove: number) => {
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(updatedPhotos);
    
    // Save changes immediately
    try {
        await fetch("/api/user/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photos: updatedPhotos })
        });
    } catch (e) {
        console.error("Failed to save photo removal", e);
        // Revert on failure? For now just log.
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center">Nalaganje...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-pink-600 p-6 text-white flex justify-between items-center">
            <h1 className="text-2xl font-bold">Urejanje Profila</h1>
            <button onClick={handleLogout} className="text-sm bg-pink-700 px-3 py-1 rounded hover:bg-pink-800">Odjava</button>
        </div>
        
        <div className="p-8 grid md:grid-cols-2 gap-12">
            
            {/* Left Column: My Details */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">O Meni</h2>
                <div className="space-y-4">
                    {/* Photo Upload Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Moje Fotografije</h3>
                        <p className="text-sm text-gray-500 mb-3">
                            Sistem bo samodejno prilagodil sliko okvirju. Svetujemo, da naložite sliko, kjer ste jasno vidni.
                            Če vam slika ni všeč, jo lahko preprosto odstranite.
                        </p>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                    <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => handleRemovePhoto(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Odstrani fotografijo"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    disabled={uploading}
                                />
                                <div className="text-center">
                                    {uploading ? (
                                        <p className="text-sm text-gray-500">Nalagam...</p>
                                    ) : (
                                        <p className="text-sm text-gray-500">+</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ime / Vzdevek</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Višina (cm)</label>
                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Datum Rojstva</label>
                        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isSmoker} onChange={e => setIsSmoker(e.target.checked)} id="smoker" />
                        <label htmlFor="smoker" className="text-sm text-gray-700">Sem kadilec</label>
                    </div>
                    
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h3 className="font-semibold text-purple-900 mb-2">Nastavitve Zasebnosti</h3>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={voiceCallAllowed} onChange={e => setVoiceCallAllowed(e.target.checked)} id="voice" />
                            <label htmlFor="voice" className="text-sm text-gray-700">Dovolim glasovne klice</label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Če izklopljeno, vas nihče ne more poklicati.</p>
                    </div>
                </div>

                {/* Traits Section */}
                <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Osebnost in Zanimanja</h2>

                    <div className="mb-6">
                         <h3 className="font-semibold text-blue-600 mb-2">Kakšen sem / Kakšna sem (Max 5, 1-2 besedi)</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {personalTraits.map((trait, idx) => (
                                <input
                                    key={`pt-${idx}`}
                                    type="text"
                                    value={trait}
                                    placeholder={`Lastnost ${idx + 1}`}
                                    maxLength={20}
                                    className="border rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    onChange={(e) => {
                                        const newVal = [...personalTraits];
                                        newVal[idx] = e.target.value;
                                        setPersonalTraits(newVal);
                                    }}
                                />
                            ))}
                         </div>
                    </div>

                    <div>
                         <h3 className="font-semibold text-pink-600 mb-2">Kaj me privlači (Max 5, 1-2 besedi)</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {partnerTraits.map((trait, idx) => (
                                <input
                                    key={`partner-${idx}`}
                                    type="text"
                                    value={trait}
                                    placeholder={`Lastnost ${idx + 1}`}
                                    maxLength={20}
                                    className="border rounded px-3 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                    onChange={(e) => {
                                        const newVal = [...partnerTraits];
                                        newVal[idx] = e.target.value;
                                        setPartnerTraits(newVal);
                                    }}
                                />
                            ))}
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Filters (Safety) */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    Varnostni Filtri
                    <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">Kdo mi lahko piše?</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">Osebe, ki ne ustrezajo tem kriterijem, vam ne bodo mogle poslati sporočila.</p>
                
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Minimalna Višina (cm)</label>
                        <input type="number" value={minHeight} onChange={e => setMinHeight(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" placeholder="npr. 180" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Min. Leta</label>
                            <input type="number" value={minAge} onChange={e => setMinAge(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max. Leta</label>
                            <input type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={mustNotSmoke} onChange={e => setMustNotSmoke(e.target.checked)} id="filterSmoker" />
                            <label htmlFor="filterSmoker" className="text-sm text-gray-700">Blokiraj kadilce</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end">
            <button onClick={handleSave} className="px-8 py-3 bg-pink-600 text-white font-bold rounded-lg shadow hover:bg-pink-700 transition">
                Shrani Spremembe
            </button>
        </div>
      </div>
    </div>
  );
}
