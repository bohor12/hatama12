"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Interface matches Prisma schema + JSON fields
interface UserProfile {
  id: string;
  name: string | null;
  gender: string;
  birthDate: string | null;
  height: number | null;
  bio: string | null;
  location: string | null;

  isSmoker: boolean;
  voiceCallAllowed: boolean;

  photos: string[]; // Parsed from JSON
  personalTraits: string[]; // Parsed from JSON
  partnerTraits: string[]; // Parsed from JSON
  relationshipTypes: string[]; // Parsed from JSON

  isVerified: boolean;
  verificationStatus: string; // NONE, PENDING, APPROVED, REJECTED

  filter?: {
    minHeight?: number;
    minAge?: number;
    maxAge?: number;
    mustNotSmoke?: boolean;
  };
}

const RELATIONSHIP_OPTIONS = [
    { id: "LongTerm", label: "Resna zveza" },
    { id: "ShortTerm", label: "Kratka zveza" },
    { id: "Dates", label: "Zmenki" },
    { id: "Friends", label: "Prijateljstvo" },
    { id: "Sex", label: "Seks / Avantura" }
];

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [height, setHeight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isSmoker, setIsSmoker] = useState(false);
  const [voiceCallAllowed, setVoiceCallAllowed] = useState(false);
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [personalTraits, setPersonalTraits] = useState<string[]>(Array(5).fill(""));
  const [partnerTraits, setPartnerTraits] = useState<string[]>(Array(5).fill(""));
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>([]);

  // Filter Fields
  const [minHeight, setMinHeight] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [mustNotSmoke, setMustNotSmoke] = useState(false);

  const [uploading, setUploading] = useState(false);

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
          // Parse JSON fields safely
          const pPhotos = data.photos ? JSON.parse(data.photos) : [];
          const pPersonal = data.personalTraits ? JSON.parse(data.personalTraits) : [];
          const pPartner = data.partnerTraits ? JSON.parse(data.partnerTraits) : [];
          const pRelTypes = data.relationshipTypes ? JSON.parse(data.relationshipTypes) : [];

          // Pad traits to 5
          const paddedPersonal = [...pPersonal, ...Array(5).fill("")].slice(0, 5);
          const paddedPartner = [...pPartner, ...Array(5).fill("")].slice(0, 5);

          const profile: UserProfile = {
              ...data,
              photos: pPhotos,
              personalTraits: paddedPersonal,
              partnerTraits: paddedPartner,
              relationshipTypes: pRelTypes
          };

          setUser(profile);

          // Initialize Form
          setName(data.name || "");
          setHeight(data.height?.toString() || "");
          setBirthDate(data.birthDate ? data.birthDate.split('T')[0] : "");
          setIsSmoker(data.isSmoker || false);
          setVoiceCallAllowed(data.voiceCallAllowed || false);
          
          setPhotos(pPhotos);
          setPersonalTraits(paddedPersonal);
          setPartnerTraits(paddedPartner);
          setRelationshipTypes(pRelTypes);

          if (data.filter) {
              setMinHeight(data.filter.minHeight?.toString() || "");
              setMinAge(data.filter.minAge?.toString() || "");
              setMaxAge(data.filter.maxAge?.toString() || "");
              setMustNotSmoke(data.filter.mustNotSmoke || false);
          }
        }
        setLoading(false);
      });
  }, [router]);

  const handleSave = async () => {
      // Validate
      const cleanPersonal = personalTraits.filter(t => t.trim() !== "");
      const cleanPartner = partnerTraits.filter(t => t.trim() !== "");

      const payload = {
          name,
          height: height ? parseInt(height) : null,
          birthDate,
          isSmoker,
          voiceCallAllowed,
          personalTraits: cleanPersonal,
          partnerTraits: cleanPartner,
          relationshipTypes,
          filter: {
              minHeight: minHeight ? parseInt(minHeight) : null,
              minAge: minAge ? parseInt(minAge) : null,
              maxAge: maxAge ? parseInt(maxAge) : null,
              mustNotSmoke
          }
      };

      try {
        const res = await fetch("/api/user/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Profil uspešno shranjen!");
            router.push("/browse");
        } else {
            alert("Napaka pri shranjevanju.");
        }
      } catch (e) {
          console.error(e);
          alert("Napaka pri povezavi.");
      }
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
        // Ideally update backend immediately or wait for save?
        // Let's assume user must click Save to persist the photos array in DB,
        // OR the upload endpoint updates the user record?
        // Usually, upload returns URL, and we update the 'photos' array in User model via PUT /me
        // For better UX, let's auto-save photos change
        updatePhotosOnServer([...photos, data.url]);
        alert("Fotografija naložena!");
      } else {
        alert("Napaka pri nalaganju.");
      }
    } catch (error) {
      console.error(error);
      alert("Napaka pri nalaganju.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (indexToRemove: number) => {
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(updatedPhotos);
    await updatePhotosOnServer(updatedPhotos);
  };

  const updatePhotosOnServer = async (newPhotos: string[]) => {
      await fetch("/api/user/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ photos: newPhotos })
      });
  };

  const toggleRelationshipType = (id: string) => {
      setRelationshipTypes(prev => {
          if (prev.includes(id)) return prev.filter(x => x !== id);
          return [...prev, id];
      });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center">Nalaganje profila...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-pink-600 p-6 text-white flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Urejanje Profila</h1>
                {user?.isVerified && (
                    <span className="flex items-center gap-1 text-sm bg-pink-700 px-2 py-1 rounded-full mt-1 w-fit">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        Verificiran račun
                    </span>
                )}
            </div>
            <button onClick={handleLogout} className="text-sm bg-pink-800/50 hover:bg-pink-800 px-4 py-2 rounded transition">Odjava</button>
        </div>
        
        <div className="p-8 grid md:grid-cols-2 gap-12">
            
            {/* Left Column */}
            <div className="space-y-8">

                {/* Photos */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Moje Fotografije</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
                                <img src={photo} alt={`User ${index}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleRemovePhoto(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                            <div className="text-center text-gray-500">
                                {uploading ? <p className="text-xs">Nalaganje...</p> : <span className="text-2xl">+</span>}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Basic Info */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Osebni Podatki</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ime / Vzdevek</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Višina (cm)</label>
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Datum Rojstva</label>
                            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isSmoker} onChange={e => setIsSmoker(e.target.checked)} className="rounded text-pink-600 focus:ring-pink-500" />
                            <span className="text-sm text-gray-700">Sem kadilec</span>
                        </label>
                    </div>

                     <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <label className="flex items-center gap-2 cursor-pointer mb-1">
                            <input type="checkbox" checked={voiceCallAllowed} onChange={e => setVoiceCallAllowed(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" />
                            <span className="font-semibold text-purple-900 text-sm">Dovolim glasovne klice</span>
                        </label>
                        <p className="text-xs text-purple-700/70 ml-6">Drugi uporabniki vas bodo lahko poklicali preko aplikacije.</p>
                    </div>
                </section>

            </div>

            {/* Right Column */}
            <div className="space-y-8">

                {/* Traits */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Profil & Želje</h2>
                    
                    {/* Relationship Types */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Kaj iščem?</h3>
                        <div className="flex flex-wrap gap-2">
                            {RELATIONSHIP_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => toggleRelationshipType(opt.id)}
                                    className={`px-3 py-1.5 text-sm rounded-full border transition ${
                                        relationshipTypes.includes(opt.id)
                                            ? "bg-pink-600 text-white border-pink-600"
                                            : "bg-white text-gray-600 border-gray-300 hover:border-pink-300"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                         <h3 className="text-sm font-semibold text-blue-600 mb-2">Moje lastnosti (Max 5)</h3>
                         <div className="grid grid-cols-2 gap-2">
                            {personalTraits.map((trait, idx) => (
                                <input 
                                    key={`pt-${idx}`}
                                    type="text"
                                    value={trait}
                                    placeholder={`Lastnost ${idx + 1}`}
                                    maxLength={20}
                                    className="border rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                         <h3 className="text-sm font-semibold text-pink-600 mb-2">Pri partnerju iščem (Max 5)</h3>
                         <div className="grid grid-cols-2 gap-2">
                            {partnerTraits.map((trait, idx) => (
                                <input 
                                    key={`partner-${idx}`}
                                    type="text"
                                    value={trait}
                                    placeholder={`Lastnost ${idx + 1}`}
                                    maxLength={20}
                                    className="border rounded px-3 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                    onChange={(e) => {
                                        const newVal = [...partnerTraits];
                                        newVal[idx] = e.target.value;
                                        setPartnerTraits(newVal);
                                    }}
                                />
                            ))}
                         </div>
                    </div>
                </section>

                {/* Filters */}
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        Varnostni Filtri
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Kdo mi lahko piše</span>
                    </h2>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Min. Višina (cm)</label>
                            <input type="number" value={minHeight} onChange={e => setMinHeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="npr. 180" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Min. Leta</label>
                                <input type="number" value={minAge} onChange={e => setMinAge(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="18" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max. Leta</label>
                                <input type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="99" />
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={mustNotSmoke} onChange={e => setMustNotSmoke(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
                                <span className="text-sm text-gray-700">Blokiraj kadilce</span>
                            </label>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
             <div className="text-sm text-gray-500">
                 {user?.verificationStatus === 'NONE' && (
                     <span>Status: <span className="text-gray-700 font-medium">Nepreverjen</span></span>
                 )}
                 {user?.verificationStatus === 'PENDING' && (
                     <span>Status: <span className="text-orange-600 font-medium">V preverjanju...</span></span>
                 )}
                 {user?.verificationStatus === 'APPROVED' && (
                     <span>Status: <span className="text-green-600 font-medium">Verificiran</span></span>
                 )}
             </div>
            <button onClick={handleSave} className="px-8 py-3 bg-pink-600 text-white font-bold rounded-lg shadow-lg hover:bg-pink-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
                Shrani Spremembe
            </button>
        </div>
      </div>
    </div>
  );
}
