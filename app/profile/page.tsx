"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TinderCard from "react-tinder-card";

// Relationship Type Options
const RELATIONSHIP_OPTIONS = [
    { id: "Sex", label: "Seks" },
    { id: "Dates", label: "Redna srečanja (Zmenki & Seks)" },
    { id: "Friends", label: "Prijateljstvo" },
    { id: "LongTerm", label: "Resna zveza" },
];

// Partner Traits Options
const TRAIT_OPTIONS = [
    "Iskrenost", "Humor", "Zvestoba", "Spoštovanje", "Družina",
    "Komunikacija", "Šport", "Potovanja", "Kariera", "Videz",
    "Zabava", "Strast", "Nežnost", "Inteligentnost", "Ambicioznost",
    "Urejenost", "Pustolovski duh", "Zanesljivost", "Sproščenost"
];

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

  // New Enhanced Fields
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  // Partner Traits as Tags
  const [partnerTraits, setPartnerTraits] = useState<string[]>([]);

  // Preview
  const [showPreview, setShowPreview] = useState(false);

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
          
          // Enhanced fields
          try {
              setRelationshipTypes(data.relationshipTypes ? JSON.parse(data.relationshipTypes) : []);
              setInterests(data.interests ? JSON.parse(data.interests) : []);

              if (data.partnerTraits) {
                  // Handle both old string format and new JSON array format
                  if (data.partnerTraits.startsWith('[')) {
                      setPartnerTraits(JSON.parse(data.partnerTraits));
                  } else if (data.partnerTraits.startsWith('"')) {
                       // JSON string of string?
                       setPartnerTraits(JSON.parse(data.partnerTraits));
                  } else {
                      // It was plain text before, reset or ignore?
                      // Let's reset to empty array as text won't map to tags easily
                      // or if short, make it one tag
                       setPartnerTraits([]);
                  }
              }
          } catch(e) {
             setPartnerTraits([]);
          }
          setDescription(data.bio || "");

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
              filter: {
                  minHeight,
                  minAge,
                  maxAge,
                  mustNotSmoke
              },
              // New Fields
              relationshipTypes,
              interests,
              description,
              partnerTraits // sending array now
          })
      });
      alert("Shranjeno!");
      router.push("/dashboard");
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
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const toggleRelationship = (id: string) => {
      setRelationshipTypes(prev => {
          if (prev.includes(id)) return prev.filter(x => x !== id);
          return [...prev, id];
      })
  };

  const toggleTrait = (trait: string) => {
      setPartnerTraits(prev => {
          if (prev.includes(trait)) return prev.filter(t => t !== trait);
          return [...prev, trait];
      });
  };

  const addInterest = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && interestInput.trim()) {
          if (!interests.includes(interestInput.trim())) {
              setInterests([...interests, interestInput.trim()]);
          }
          setInterestInput("");
          e.preventDefault();
      }
  };

  const removeInterest = (tag: string) => {
      setInterests(interests.filter(i => i !== tag));
  };

  // Preview Logic
  const mainPhoto = photos.length > 0 ? photos[0] : '/placeholder.png';
  const age = birthDate ? new Date().getFullYear() - new Date(birthDate).getFullYear() : "?";

  if (loading) return <div className="p-10 text-center">Nalaganje...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden relative">
        <div className="bg-pink-600 p-6 text-white flex justify-between items-center sticky top-0 z-20">
            <h1 className="text-2xl font-bold">Urejanje Profila</h1>
            <div className="flex gap-2">
                <button onClick={() => setShowPreview(true)} className="text-sm bg-white text-pink-600 font-bold px-3 py-1 rounded hover:bg-gray-100">
                    Predogled Kartice
                </button>
                <button onClick={handleLogout} className="text-sm bg-pink-700 px-3 py-1 rounded hover:bg-pink-800">Odjava</button>
            </div>
        </div>
        
        <div className="p-8 grid md:grid-cols-2 gap-12">
            
            {/* Left Column: My Details */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">O Meni</h2>
                    <div className="space-y-4">
                        {/* Photo Upload Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Moje Fotografije</h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemovePhoto(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                    <div className="text-center">
                                        {uploading ? (
                                            <p className="text-sm text-gray-500">...</p>
                                        ) : (
                                            <p className="text-sm text-gray-500 font-bold text-2xl">+</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ime / Vzdevek</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Višina (cm)</label>
                                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Datum Rojstva</label>
                                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="mt-1 w-full px-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={isSmoker} onChange={e => setIsSmoker(e.target.checked)} id="smoker" />
                            <label htmlFor="smoker" className="text-sm text-gray-700">Sem kadilec</label>
                        </div>
                    </div>
                </div>

                {/* Enhanced Profile Details */}
                <div>
                     <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Podrobnosti Profila</h2>
                     <div className="space-y-6">
                        {/* Relationship Types */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Kaj iščem? (Izberi vse kar ustreza)</label>
                             <div className="grid grid-cols-2 gap-2">
                                 {RELATIONSHIP_OPTIONS.map(opt => (
                                     <div key={opt.id}
                                          onClick={() => toggleRelationship(opt.id)}
                                          className={`cursor-pointer p-3 border rounded-lg text-sm text-center transition ${relationshipTypes.includes(opt.id) ? 'bg-pink-100 border-pink-500 text-pink-700 font-bold' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                                     >
                                         {opt.label}
                                     </div>
                                 ))}
                             </div>
                        </div>

                        {/* Partner Traits - Selectable Tags */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">Kaj me privlači / Kaj iščem? (Izberi)</label>
                             <div className="flex flex-wrap gap-2">
                                 {TRAIT_OPTIONS.map(trait => (
                                     <button
                                        key={trait}
                                        onClick={() => toggleTrait(trait)}
                                        className={`px-3 py-1 rounded-full text-sm border transition ${partnerTraits.includes(trait) ? 'bg-purple-100 border-purple-500 text-purple-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                     >
                                         {trait}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {/* Description */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">O meni / Kaj rad/a počnem</label>
                             <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                                placeholder="Opiši se, svoje hobije, kaj te veseli..."
                             ></textarea>
                        </div>


                         {/* Interests */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Interesi (Pritisni Enter za dodajanje)</label>
                             <div className="flex flex-wrap gap-2 mb-2">
                                 {interests.map(tag => (
                                     <span key={tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                         {tag}
                                         <button onClick={() => removeInterest(tag)} className="hover:text-purple-900">&times;</button>
                                     </span>
                                 ))}
                             </div>
                             <input
                                type="text"
                                value={interestInput}
                                onChange={e => setInterestInput(e.target.value)}
                                onKeyDown={addInterest}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
                                placeholder="npr. Hribi, Kuhanje, Potovanja..."
                             />
                        </div>
                     </div>
                </div>
            </div>

            {/* Right Column: Settings & Safety */}
            <div className="space-y-8">
                 <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Varnost in Zasebnost</h2>
                    <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100 mb-6">
                        <h3 className="font-semibold text-purple-900 mb-2">Nastavitve Zasebnosti</h3>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={voiceCallAllowed} onChange={e => setVoiceCallAllowed(e.target.checked)} id="voice" />
                            <label htmlFor="voice" className="text-sm text-gray-700">Dovolim glasovne klice</label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Če izklopljeno, vas nihče ne more poklicati.</p>
                    </div>

                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                        Filtri <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">Kdo mi lahko piše?</span>
                    </h3>

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
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-4 sticky bottom-0 z-20">
             <button onClick={() => setShowPreview(true)} className="px-6 py-3 bg-white border border-pink-600 text-pink-600 font-bold rounded-lg hover:bg-pink-50 transition">
                Predogled
            </button>
            <button onClick={handleSave} className="px-8 py-3 bg-pink-600 text-white font-bold rounded-lg shadow hover:bg-pink-700 transition">
                Shrani Spremembe
            </button>
        </div>

        {/* PREVIEW MODAL */}
        {showPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowPreview(false)}>
                <div className="w-full max-w-sm h-[70vh] relative" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-0 right-0 z-20 p-2">
                         <button onClick={() => setShowPreview(false)} className="bg-white rounded-full p-2 text-black shadow-lg">✕</button>
                    </div>

                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-gray-200">
                        <img src={mainPhoto} alt={name} className="w-full h-full object-cover" />

                        {/* Overlay Gradient */}
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/60 to-transparent text-white">
                            <h3 className="text-3xl font-bold flex items-end gap-2">
                                {name || "Uporabnik"}
                                <span className="text-xl font-normal opacity-90">{age}</span>
                            </h3>

                            {/* Tags/Chips - Showing Traits instead of Bio now */}
                            <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                {relationshipTypes.map(rt => {
                                    const label = RELATIONSHIP_OPTIONS.find(o => o.id === rt)?.label;
                                    return label ? <span key={rt} className="text-xs bg-pink-600 px-2 py-0.5 rounded-full">{label}</span> : null
                                })}
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {partnerTraits.slice(0, 5).map(trait => (
                                     <span key={trait} className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">{trait}</span>
                                ))}
                                {partnerTraits.length > 5 && <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">+{partnerTraits.length - 5}</span>}
                            </div>

                            {/* No Bio Description per request "Opis pa ostane seveda spodaj" */}

                             <div className="flex flex-wrap gap-1 mt-1">
                                {interests.slice(0, 3).map(tag => (
                                     <span key={tag} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                                {interests.length > 3 && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">+{interests.length - 3}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
