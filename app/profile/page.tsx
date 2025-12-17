"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Camera } from "lucide-react";

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
  
  // Verification
  const [verificationStatus, setVerificationStatus] = useState("NONE");
  const [verifying, setVerifying] = useState(false);

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
          setVerificationStatus(data.verificationStatus || "NONE");
          
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

  const handleVerificationUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/user/verify", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setVerificationStatus("PENDING");
        alert("Zahtevek za verifikacijo poslan! Administrator bo pregledal vašo sliko.");
      } else {
        alert("Napaka pri pošiljanju.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setVerifying(false);
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

  const renderVerificationStatus = () => {
      switch(verificationStatus) {
          case "APPROVED":
              return <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center gap-3 border border-blue-200">
                  <CheckCircle className="text-blue-500" />
                  <div>
                      <p className="font-bold">Verificiran Profil</p>
                      <p className="text-xs">Vaša identiteta je potrjena. Uporabniki vam bolj zaupajo.</p>
                  </div>
              </div>;
          case "PENDING":
             return <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl flex items-center gap-3 border border-yellow-200">
                  <Clock className="text-yellow-500" />
                  <div>
                      <p className="font-bold">Čakanje na potrditev</p>
                      <p className="text-xs">Vaša slika je v pregledu. Hvala za potrpežljivost.</p>
                  </div>
              </div>;
          case "REJECTED":
             return <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200">
                  <AlertCircle className="text-red-500" />
                  <div>
                      <p className="font-bold">Verifikacija Zavrnjena</p>
                      <p className="text-xs">Prosimo, poskusite znova z bolj jasno sliko.</p>
                      <label className="mt-2 inline-block bg-red-600 text-white text-xs px-3 py-1 rounded cursor-pointer hover:bg-red-700">
                        Naloži Novo Sliko
                        <input type="file" accept="image/*" onChange={handleVerificationUpload} className="hidden" />
                      </label>
                  </div>
              </div>;
          default:
              return <div className="bg-gray-100 text-gray-700 p-4 rounded-xl flex items-center gap-3 border border-gray-200">
                  <div className="bg-white p-2 rounded-full shadow-sm"><Camera size={20} /></div>
                  <div className="flex-1">
                      <p className="font-bold">Pridobi Modro Kljukico</p>
                      <p className="text-xs">Naloži selfie in potrdi svojo identiteto za več zaupanja.</p>
                  </div>
                  <label className="bg-blue-600 text-white text-xs px-4 py-2 rounded-full cursor-pointer hover:bg-blue-700 font-bold">
                    {verifying ? "..." : "Verificiraj se"}
                    <input type="file" accept="image/*" onChange={handleVerificationUpload} className="hidden" disabled={verifying} />
                  </label>
              </div>;
      }
  }

  if (loading) return <div className="p-10 text-center">Nalaganje...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header same as Dashboard */}
      <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
            <h1 className="text-xl font-bold">Urejanje Profila</h1>
        </div>
        <button onClick={handleLogout} className="text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded hover:bg-pink-200 font-semibold">Odjava</button>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Verification Section - Top Priority */}
        <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1">Status Profila</h2>
            {renderVerificationStatus()}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-12">

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
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100">
                                        <img src={photo} alt={`User photo ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => handleRemovePhoto(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            title="Odstrani fotografijo"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                            <p className="text-xs text-gray-500">Nalagam...</p>
                                        ) : (
                                            <p className="text-2xl text-gray-400 font-light">+</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ime / Vzdevek</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Višina (cm)</label>
                                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Datum Rojstva</label>
                                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none transition" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <input type="checkbox" checked={isSmoker} onChange={e => setIsSmoker(e.target.checked)} id="smoker" className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500" />
                            <label htmlFor="smoker" className="text-sm text-gray-700 font-medium">Sem kadilec</label>
                        </div>

                        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <h3 className="font-semibold text-purple-900 mb-2 text-sm">Nastavitve Zasebnosti</h3>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={voiceCallAllowed} onChange={e => setVoiceCallAllowed(e.target.checked)} id="voice" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                                <label htmlFor="voice" className="text-sm text-gray-700">Dovolim glasovne klice</label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Če izklopljeno, vas nihče ne more poklicati.</p>
                        </div>
                    </div>
                    
                    {/* Traits Section */}
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Osebnost in Zanimanja</h2>

                        <div className="mb-6">
                             <h3 className="font-semibold text-blue-600 mb-2 text-sm">Kakšen sem / Kakšna sem (Max 5)</h3>
                             <div className="grid grid-cols-2 gap-2">
                                {personalTraits.map((trait, idx) => (
                                    <input
                                        key={`pt-${idx}`}
                                        type="text"
                                        value={trait}
                                        placeholder={`Lastnost ${idx + 1}`}
                                        maxLength={20}
                                        className="w-full px-3 py-2 bg-blue-50 border-blue-100 border rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
                             <h3 className="font-semibold text-pink-600 mb-2 text-sm">Kaj me privlači (Max 5)</h3>
                             <div className="grid grid-cols-2 gap-2">
                                {partnerTraits.map((trait, idx) => (
                                    <input
                                        key={`partner-${idx}`}
                                        type="text"
                                        value={trait}
                                        placeholder={`Lastnost ${idx + 1}`}
                                        maxLength={20}
                                        className="w-full px-3 py-2 bg-pink-50 border-pink-100 border rounded-lg text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimalna Višina (cm)</label>
                            <input type="number" value={minHeight} onChange={e => setMinHeight(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="npr. 180" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Leta</label>
                                <input type="number" value={minAge} onChange={e => setMinAge(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max. Leta</label>
                                <input type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={mustNotSmoke} onChange={e => setMustNotSmoke(e.target.checked)} id="filterSmoker" className="w-4 h-4 text-pink-600 rounded" />
                                <label htmlFor="filterSmoker" className="text-sm text-gray-700">Blokiraj kadilce</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button onClick={handleSave} className="px-8 py-3 bg-pink-600 text-white font-bold rounded-xl shadow-lg hover:bg-pink-700 hover:shadow-xl transition transform hover:-translate-y-0.5">
                    Shrani Spremembe
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
