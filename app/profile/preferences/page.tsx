"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import FadeIn from "../../components/ui/FadeIn";
import SloveniaMap from "../../components/map/SloveniaMap";

const TAGS_SELF: string[] = ["Mlad", "Starejši", "Resen", "Avanturist", "Športnik", "Urejen", "Miren", "Dominanten", "Submisiven", "Bogataš", "Študent"];

const TAGS_PARTNER: string[] = ["Starejša", "Mlajša", "Milf", "Resna", "Avanturistka", "Športnica", "Urejena", "Mirna", "Dominantna", "Submisivna", "Študentka"];

export default function ProfilePreferences() {
    const router = useRouter();
    const [tagsSelf, setTagsSelf] = useState<string[]>([]);
    const [tagsLookingFor, setTagsLookingFor] = useState<string[]>([]);
    const [ageMin, setAgeMin] = useState(18);
    const [ageMax, setAgeMax] = useState(60);
    const [region, setRegion] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/me/preferences")
            .then((res) => res.json())
            .then((data) => {
                if (data.tagsSelf) setTagsSelf(data.tagsSelf.split(",").filter(Boolean));
                if (data.tagsLookingFor) setTagsLookingFor(data.tagsLookingFor.split(",").filter(Boolean));
                if (data.ageRangeMin) setAgeMin(data.ageRangeMin);
                if (data.ageRangeMax) setAgeMax(data.ageRangeMax);
                if (data.region) setRegion(data.region);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggleTag = (tag: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(tag)) {
            setList(list.filter((t: string) => t !== tag));
        } else {
            if (list.length >= 5) return toast.warning("Izbereš lahko največ 5 oznak.");
            setList([...list, tag]);
        }
    };

    const handleSave = async () => {
        const res = await fetch("/api/user/me/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tagsSelf: tagsSelf.join(","),
                tagsLookingFor: tagsLookingFor.join(","),
                ageRangeMin: Number(ageMin),
                ageRangeMax: Number(ageMax),
                region
            })
        });

        if (res.ok) {
            toast.success("Nastavitve shranjene!", { description: "Algoritem sedaj išče tvoja ujemanja v tvoji regiji." });
            router.push("/dashboard");
        } else {
            toast.error("Napaka pri shranjevanju.");
        }
    };

    if (loading) return <div className="p-10 text-center">Nalaganje...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white sticky top-0 z-10 p-4 shadow-sm flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft /></Link>
                <h1 className="font-bold text-gray-800 text-lg">Moje Preference ⚡</h1>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-xl space-y-8">
                <FadeIn>
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-2xl text-white mb-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="text-yellow-300" />
                            <h2 className="text-xl font-bold">Pametni Algoritem</h2>
                        </div>
                        <p className="opacity-90 text-sm">
                            Bolj natančno ko opišeš sebe in svoje želje, boljša bodo ujemanja. Algoritem sedaj upošteva tudi tvojo regijo! 📍
                        </p>
                    </div>
                </FadeIn>

                <FadeIn delay={0.1} className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Kdo sem jaz?</h3>
                    <div className="flex flex-wrap gap-2">
                        {TAGS_SELF.map((tag: string) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag, tagsSelf, setTagsSelf)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${tagsSelf.includes(tag) ? "bg-pink-600 text-white shadow-pink-200 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                <FadeIn delay={0.2} className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Koga iščem?</h3>
                    <div className="flex flex-wrap gap-2">
                        {TAGS_PARTNER.map((tag: string) => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag, tagsLookingFor, setTagsLookingFor)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${tagsLookingFor.includes(tag) ? "bg-purple-600 text-white shadow-purple-200 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </FadeIn>

                <FadeIn delay={0.3} className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4">Starostni razpon: {ageMin} - {ageMax} let</h3>
                    <div className="flex gap-4 items-center">
                        <input
                            type="range" min="18" max="99"
                            value={ageMin} onChange={(e) => setAgeMin(Math.min(Number(e.target.value), ageMax - 1))}
                            className="w-full accent-pink-600"
                        />
                        <input
                            type="range" min="18" max="99"
                            value={ageMax} onChange={(e) => setAgeMax(Math.max(Number(e.target.value), ageMin + 1))}
                            className="w-full accent-purple-600"
                        />
                    </div>
                </FadeIn>

                {/* Lokacija */}
                <FadeIn delay={0.4} className="bg-transparent">
                    <SloveniaMap selectedRegion={region} onSelectRegion={setRegion} />
                </FadeIn>

                <button
                    onClick={handleSave}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg"
                >
                    <Save size={20} /> Shrani Nastavitve
                </button>
            </main>
        </div>
    );
}
