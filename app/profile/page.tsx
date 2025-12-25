"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Camera } from "lucide-react";
import ProfilePreview from "../components/ProfilePreview";

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
    const [browseAnonymously, setBrowseAnonymously] = useState(false);

    // Visibility Settings - What others can see
    const [showAge, setShowAge] = useState(true);
    const [showHeight, setShowHeight] = useState(true);
    const [showOccupation, setShowOccupation] = useState(true);
    const [showEducation, setShowEducation] = useState(true);
    const [showChildren, setShowChildren] = useState(false);

    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Verification
    const [verificationStatus, setVerificationStatus] = useState("NONE");
    const [verifying, setVerifying] = useState(false);

    // Traits
    const [personalTraits, setPersonalTraits] = useState<string[]>(Array(5).fill(""));
    const [partnerTraits, setPartnerTraits] = useState<string[]>(Array(5).fill(""));


    // Filter States
    const [minHeight, setMinHeight] = useState("");
    const [maxHeight, setMaxHeight] = useState("");
    const [minAge, setMinAge] = useState("18");
    const [maxAge, setMaxAge] = useState("99");
    const [mustNotSmoke, setMustNotSmoke] = useState(false);
    const [preferredRegion, setPreferredRegion] = useState("");
    const [mustHavePhoto, setMustHavePhoto] = useState(false);
    const [mustBeVerified, setMustBeVerified] = useState(false);

    // Advanced Filter Preferences
    const [preferredHairColor, setPreferredHairColor] = useState("");
    const [preferredEyeColor, setPreferredEyeColor] = useState("");
    const [preferredBodyType, setPreferredBodyType] = useState("");
    const [preferredRelationType, setPreferredRelationType] = useState("");
    const [mustNotHaveChildren, setMustNotHaveChildren] = useState(false);
    const [mustWantChildren, setMustWantChildren] = useState(false);
    const [preferredEducation, setPreferredEducation] = useState("");

    // User's Own Physical Attributes
    const [hairColor, setHairColor] = useState("");
    const [eyeColor, setEyeColor] = useState("");
    const [bodyType, setBodyType] = useState("");
    const [relationshipType, setRelationshipType] = useState("");
    const [hasChildren, setHasChildren] = useState<boolean | null>(null);
    const [wantsChildren, setWantsChildren] = useState<boolean | null>(null);
    const [education, setEducation] = useState("");
    const [occupation, setOccupation] = useState("");

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
                    setBrowseAnonymously(data.browseAnonymously || false);
                    setPhotos(data.photos ? JSON.parse(data.photos) : []);
                    setVerificationStatus(data.verificationStatus || "NONE");

                    // Load visibility settings
                    setShowAge(data.showAge !== false);
                    setShowHeight(data.showHeight !== false);
                    setShowOccupation(data.showOccupation !== false);
                    setShowEducation(data.showEducation !== false);
                    setShowChildren(data.showChildren || false);

                    const pTraits = data.personalTraits ? JSON.parse(data.personalTraits) : [];
                    const partnerT = data.partnerTraits ? JSON.parse(data.partnerTraits) : [];

                    // Ensure arrays are length 5
                    const paddedPT = [...pTraits, ...Array(5).fill("")].slice(0, 5);
                    const paddedPartner = [...partnerT, ...Array(5).fill("")].slice(0, 5);

                    setPersonalTraits(paddedPT);
                    setPartnerTraits(paddedPartner);

                    if (data.filter) {
                        setMinHeight(data.filter.minHeight?.toString() || "");
                        setMaxHeight(data.filter.maxHeight?.toString() || "");
                        setMinAge(data.filter.minAge?.toString() || "18");
                        setMaxAge(data.filter.maxAge?.toString() || "99");
                        setMustNotSmoke(data.filter.mustNotSmoke || false);
                        setPreferredRegion(data.filter.preferredRegion || "");
                        setMustHavePhoto(data.filter.mustHavePhoto || false);
                        setMustBeVerified(data.filter.mustBeVerified || false);
                        // Advanced filter preferences
                        setPreferredHairColor(data.filter.preferredHairColor || "");
                        setPreferredEyeColor(data.filter.preferredEyeColor || "");
                        setPreferredBodyType(data.filter.preferredBodyType || "");
                        setPreferredRelationType(data.filter.preferredRelationType || "");
                        setMustNotHaveChildren(data.filter.mustNotHaveChildren || false);
                        setMustWantChildren(data.filter.mustWantChildren || false);
                        setPreferredEducation(data.filter.preferredEducation || "");
                    }
                    // User's own physical attributes
                    setHairColor(data.hairColor || "");
                    setEyeColor(data.eyeColor || "");
                    setBodyType(data.bodyType || "");
                    setRelationshipType(data.relationshipType || "");
                    setHasChildren(data.hasChildren ?? null);
                    setWantsChildren(data.wantsChildren ?? null);
                    setEducation(data.education || "");
                    setOccupation(data.occupation || "");
                }
                setLoading(false);
            });
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        await fetch("/api/user/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                height,
                birthDate,
                isSmoker,
                voiceCallAllowed,
                browseAnonymously,
                personalTraits: personalTraits.filter(t => t.trim() !== ""),
                partnerTraits: partnerTraits.filter(t => t.trim() !== ""),
                // Physical attributes
                hairColor: hairColor || null,
                eyeColor: eyeColor || null,
                bodyType: bodyType || null,
                relationshipType: relationshipType || null,
                hasChildren,
                wantsChildren,
                education: education || null,
                occupation: occupation || null,
                // Visibility settings
                showAge,
                showHeight,
                showOccupation,
                showEducation,
                showChildren,
                // Filter preferences
                filter: {
                    minHeight,
                    maxHeight,
                    minAge,
                    maxAge,
                    mustNotSmoke,
                    preferredRegion,
                    mustHavePhoto,
                    mustBeVerified,
                    preferredHairColor: preferredHairColor || null,
                    preferredEyeColor: preferredEyeColor || null,
                    preferredBodyType: preferredBodyType || null,
                    preferredRelationType: preferredRelationType || null,
                    mustNotHaveChildren,
                    mustWantChildren,
                    preferredEducation: preferredEducation || null
                }
            })
        });
        setSaving(false);
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

    const renderVerificationStatus = () => {
        switch (verificationStatus) {
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
                        <p className="text-xs">Preveri svojo identiteto z obraznim skeniranjem za več zaupanja.</p>
                    </div>
                    <Link href="/verify" className="bg-blue-600 text-white text-xs px-4 py-2 rounded-full hover:bg-blue-700 font-bold">
                        Verificiraj se
                    </Link>
                </div>;
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
    };

    if (loading) return <div className="p-10 text-center">Nalaganje...</div>;

    return (
        <>
            {/* Profile Preview Modal */}
            <ProfilePreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                userData={{
                    name,
                    photos,
                    height,
                    birthDate,
                    isSmoker,
                    hairColor,
                    eyeColor,
                    bodyType,
                    relationshipType,
                    hasChildren,
                    wantsChildren,
                    education,
                    occupation,
                    isVerified: verificationStatus === "APPROVED",
                    personalTraits
                }}
            />

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header same as Dashboard */}
                <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-600"><ArrowLeft /></Link>
                        <h1 className="text-xl font-bold">Urejanje Profila</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md"
                        >
                            👁️ Predogled
                        </button>
                        <button onClick={handleLogout} className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 font-medium">Odjava</button>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto p-4 md:p-8">

                    {/* Verification Section - Top Priority */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-3 ml-1">Status Profila</h2>
                        {renderVerificationStatus()}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                        <div className="p-6 md:p-8">

                            {/* My Details */}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">O Meni</h2>
                                <div className="space-y-4">
                                    {/* Photo Upload Section - Enhanced */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">📸 Moje Fotografije</h3>
                                            <span className={`text-sm font-bold px-2 py-1 rounded-full ${photos.length >= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {photos.length}/5
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Prva slika je tvoja <strong>profilna slika</strong>. Maksimalno 5 fotografij.
                                        </p>
                                        <button
                                            onClick={() => setShowPreview(true)}
                                            className="text-sm text-pink-600 hover:text-pink-700 underline mb-3 inline-flex items-center gap-1"
                                        >
                                            👁️ Poglej kako me vidijo drugi
                                        </button>

                                        <div className="grid grid-cols-5 gap-3 mb-4">
                                            {/* Photo slots (max 5) */}
                                            {[0, 1, 2, 3, 4].map((index) => (
                                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100 border-2 border-gray-200">
                                                    {photos[index] ? (
                                                        <>
                                                            <img src={photos[index]} alt={`Slika ${index + 1}`} className="w-full h-full object-cover" />
                                                            {/* Profile pic crown for first photo */}
                                                            {index === 0 && (
                                                                <div className="absolute top-1 left-1 bg-yellow-400 text-white rounded-full p-1 shadow-sm" title="Profilna slika">
                                                                    👑
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={() => handleRemovePhoto(index)}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                                title="Odstrani"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                </svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="relative w-full h-full flex items-center justify-center hover:bg-gray-50 transition cursor-pointer border-2 border-dashed border-gray-300 rounded-xl">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                disabled={uploading || photos.length >= 5}
                                                            />
                                                            <div className="text-center">
                                                                {uploading ? (
                                                                    <span className="text-xs text-gray-400">⏳</span>
                                                                ) : (
                                                                    <>
                                                                        <p className="text-xl text-gray-300">+</p>
                                                                        {index === 0 && <p className="text-[10px] text-gray-400">Profilna</p>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
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

                                    {/* Physical Attributes Section */}
                                    <div className="mt-6 border-t pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-800">✨ Moj Videz & Življenjski Slog</h3>
                                            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">O Meni</span>
                                        </div>

                                        {/* Row 1: Hair & Eyes */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">💇 Barva Las</label>
                                                <select value={hairColor} onChange={e => setHairColor(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                                    <option value="">Izberi...</option>
                                                    <option value="Črna">Črna</option>
                                                    <option value="Rjava">Rjava</option>
                                                    <option value="Blond">Blond</option>
                                                    <option value="Rdeča">Rdeča</option>
                                                    <option value="Siva">Siva / Bela</option>
                                                    <option value="Brez">Brez las</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">👁️ Barva Oči</label>
                                                <select value={eyeColor} onChange={e => setEyeColor(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                                    <option value="">Izberi...</option>
                                                    <option value="Rjave">Rjave</option>
                                                    <option value="Modre">Modre</option>
                                                    <option value="Zelene">Zelene</option>
                                                    <option value="Sive">Sive</option>
                                                    <option value="Mešane">Mešane / Drugo</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 2: Body & Relationship */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">💪 Postava</label>
                                                <select value={bodyType} onChange={e => setBodyType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                                    <option value="">Izberi...</option>
                                                    <option value="Vitka">Vitka</option>
                                                    <option value="Povprečna">Povprečna</option>
                                                    <option value="Atletska">Atletska</option>
                                                    <option value="Krepka">Krepka</option>
                                                    <option value="Par extra kg">Par extra kg</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">💝 Kaj Iščem</label>
                                                <select value={relationshipType} onChange={e => setRelationshipType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                                    <option value="">Izberi...</option>
                                                    <option value="Resna zveza">Resna zveza</option>
                                                    <option value="Prijateljstvo">Prijateljstvo</option>
                                                    <option value="Pustolovščina">Pustolovščina</option>
                                                    <option value="Odprto">Odprto za vse</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 3: Children */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">👶 Imam Otroke?</label>
                                                <select
                                                    value={hasChildren === null ? "" : hasChildren ? "da" : "ne"}
                                                    onChange={e => setHasChildren(e.target.value === "" ? null : e.target.value === "da")}
                                                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                                >
                                                    <option value="">Ne želim deliti</option>
                                                    <option value="ne">Ne</option>
                                                    <option value="da">Da</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">🍼 Želim Otroke?</label>
                                                <select
                                                    value={wantsChildren === null ? "" : wantsChildren ? "da" : "ne"}
                                                    onChange={e => setWantsChildren(e.target.value === "" ? null : e.target.value === "da")}
                                                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                                >
                                                    <option value="">Ne želim deliti</option>
                                                    <option value="ne">Ne</option>
                                                    <option value="da">Da</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 4: Education & Occupation */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">🎓 Izobrazba</label>
                                                <select value={education} onChange={e => setEducation(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none">
                                                    <option value="">Izberi...</option>
                                                    <option value="Osnovna">Osnovna šola</option>
                                                    <option value="Srednja">Srednja šola</option>
                                                    <option value="Višja">Višja šola</option>
                                                    <option value="Visoka">Visoka / Univerzitetna</option>
                                                    <option value="Magisterij">Magisterij</option>
                                                    <option value="Doktorat">Doktorat</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">💼 Poklic</label>
                                                <input
                                                    type="text"
                                                    value={occupation}
                                                    onChange={e => setOccupation(e.target.value)}
                                                    placeholder="npr. Programer, Učiteljica..."
                                                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <h3 className="font-semibold text-purple-900 mb-2 text-sm">Nastavitve Zasebnosti</h3>
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="checkbox" checked={voiceCallAllowed} onChange={e => setVoiceCallAllowed(e.target.checked)} id="voice" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                                            <label htmlFor="voice" className="text-sm text-gray-700">Dovolim glasovne klice</label>
                                        </div>
                                        <div className="flex items-center gap-2 bg-pink-100 p-3 rounded-lg border border-pink-200">
                                            <input type="checkbox" checked={browseAnonymously} onChange={e => setBrowseAnonymously(e.target.checked)} id="anon" className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500" />
                                            <div>
                                                <label htmlFor="anon" className="text-sm text-gray-800 font-bold">🙈 Anonimno Brskanje</label>
                                                <p className="text-xs text-gray-600">Brskaj profile brez, da drugi vedo. Samo zate!</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visibility Settings - What others can see */}
                                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-blue-900 text-sm">👁️ Kaj Vidijo Drugi</h3>
                                            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">Vidljivost</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3">Izberi katere informacije so javne na tvojem profilu.</p>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                <input type="checkbox" checked={showAge} onChange={e => setShowAge(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-800">📅 Starost</span>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${showAge ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {showAge ? 'Vidno' : 'Skrito'}
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                <input type="checkbox" checked={showHeight} onChange={e => setShowHeight(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-800">📏 Višina</span>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${showHeight ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {showHeight ? 'Vidno' : 'Skrito'}
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                <input type="checkbox" checked={showOccupation} onChange={e => setShowOccupation(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-800">💼 Poklic</span>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${showOccupation ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {showOccupation ? 'Vidno' : 'Skrito'}
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                <input type="checkbox" checked={showEducation} onChange={e => setShowEducation(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-800">🎓 Izobrazba</span>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${showEducation ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {showEducation ? 'Vidno' : 'Skrito'}
                                                </span>
                                            </label>

                                            <label className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition border border-amber-200">
                                                <input type="checkbox" checked={showChildren} onChange={e => setShowChildren(e.target.checked)} className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" />
                                                <div className="flex-1">
                                                    <span className="text-sm text-gray-800">👶 Status Otrok</span>
                                                    <p className="text-xs text-gray-500">Občutljiva informacija</p>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${showChildren ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                    {showChildren ? 'Vidno' : 'Skrito'}
                                                </span>
                                            </label>
                                        </div>
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

                                {/* Filter Section - Premium Redesign */}
                                <div className="mt-8 border-t pt-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-800">🎯 Koga Iščem</h2>
                                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Filtri</span>
                                    </div>

                                    {/* Age Range */}
                                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-2xl mb-4 border border-purple-100">
                                        <label className="block text-sm font-bold text-gray-800 mb-3">📅 Starostni Razpon</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500">Od</span>
                                                <input
                                                    type="number"
                                                    value={minAge}
                                                    min="18" max="99"
                                                    onChange={e => setMinAge(e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center font-bold text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                            <span className="text-gray-400 font-bold">—</span>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500">Do</span>
                                                <input
                                                    type="number"
                                                    value={maxAge}
                                                    min="18" max="99"
                                                    onChange={e => setMaxAge(e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-center font-bold text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Height Range */}
                                    <div className="bg-gray-50 p-5 rounded-2xl mb-4 border border-gray-100">
                                        <label className="block text-sm font-bold text-gray-800 mb-3">📏 Višina (cm)</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-gray-500">Min</span>
                                                <input
                                                    type="number"
                                                    value={minHeight}
                                                    placeholder="npr. 160"
                                                    onChange={e => setMinHeight(e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Max</span>
                                                <input
                                                    type="number"
                                                    value={maxHeight}
                                                    placeholder="npr. 190"
                                                    onChange={e => setMaxHeight(e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Region Selector */}
                                    <div className="bg-blue-50 p-5 rounded-2xl mb-4 border border-blue-100">
                                        <label className="block text-sm font-bold text-gray-800 mb-3">📍 Želena Regija</label>
                                        <select
                                            value={preferredRegion}
                                            onChange={e => setPreferredRegion(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="">Vse regije</option>
                                            <option value="Osrednjeslovenska">Osrednjeslovenska (Ljubljana)</option>
                                            <option value="Podravska">Podravska (Maribor)</option>
                                            <option value="Savinjska">Savinjska (Celje)</option>
                                            <option value="Gorenjska">Gorenjska (Kranj)</option>
                                            <option value="Pomurska">Pomurska (Murska Sobota)</option>
                                            <option value="Obalno-kraška">Obalno-kraška (Koper)</option>
                                            <option value="Jugovzhodna">Jugovzhodna (Novo mesto)</option>
                                            <option value="Goriška">Goriška (Nova Gorica)</option>
                                            <option value="Koroška">Koroška (Slovenj Gradec)</option>
                                            <option value="Zasavska">Zasavska (Trbovlje)</option>
                                            <option value="Posavska">Posavska (Krško)</option>
                                            <option value="Primorsko-notranjska">Primorsko-notranjska (Postojna)</option>
                                        </select>
                                    </div>

                                    {/* Toggle Filters */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-gray-600 mb-2">⚙️ Dodatni Filtri</h3>

                                        {/* Must Not Smoke */}
                                        <label className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                            <input
                                                type="checkbox"
                                                checked={mustNotSmoke}
                                                onChange={e => setMustNotSmoke(e.target.checked)}
                                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-800">🚭 Samo Nekadilci</span>
                                                <p className="text-xs text-gray-500">Izključi osebe, ki kadijo</p>
                                            </div>
                                        </label>

                                        {/* Must Have Photo */}
                                        <label className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                            <input
                                                type="checkbox"
                                                checked={mustHavePhoto}
                                                onChange={e => setMustHavePhoto(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-800">📷 Mora Imeti Sliko</span>
                                                <p className="text-xs text-gray-500">Prikaži samo profile s fotografijo</p>
                                            </div>
                                        </label>

                                        {/* Must Be Verified */}
                                        <label className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition">
                                            <input
                                                type="checkbox"
                                                checked={mustBeVerified}
                                                onChange={e => setMustBeVerified(e.target.checked)}
                                                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium text-gray-800">✓ Samo Verificirani</span>
                                                <p className="text-xs text-gray-500">Prikaži samo preverjene uporabnike</p>
                                            </div>
                                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Varno</span>
                                        </label>
                                    </div>
                                </div>

                                <button onClick={handleSave} className="w-full mt-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                                    {saving ? 'Shranjujem...' : 'Shrani spremembe'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
