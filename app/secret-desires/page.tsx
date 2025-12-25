"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Flame, EyeOff } from "lucide-react";
import { toast } from "sonner";
import FadeIn from "../components/ui/FadeIn";

const FANTASIES = [
    { id: "candles", label: "Romantična večerja ob svečah 🕯️" },
    { id: "massage", label: "Čutna masaža 💆‍♀️" },
    { id: "roleplay", label: "Igranje vlog (Roleplay) 🎭" },
    { id: "public", label: "Adrenalin v naravi 🌲" },
    { id: "toys", label: "Uporaba igračk 🧸" },
    { id: "bdsm_light", label: "Vezanje (Light) 🎀" },
];

export default function SecretDesires() {
    const [selected, setSelected] = useState<string[]>([]);
    const [isSaved, setIsSaved] = useState(false);

    const toggleFantasy = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((i) => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSave = () => {
        // API simulation
        setTimeout(() => {
            setIsSaved(true);
            toast.success("Fantazije shranjene!", {
                description: "Prikazale se bodo le osebam, ki izberejo enako.",
            });
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-purple-100 font-sans pb-20">
            <header className="p-4 flex items-center gap-4 bg-gray-800 shadow-md">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-white/10 transition">
                    <ArrowLeft />
                </Link>
                <span className="text-xl font-bold flex items-center gap-2">
                    <Lock size={20} className="text-purple-500" />
                    Skrite Fantazije
                </span>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <FadeIn className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Kaj ti požene kri po žilah?
                    </h1>
                    <p className="text-gray-400">
                        Izberi svoje skrivne želje. <br />
                        <span className="font-bold text-gray-200">Vidne bodo le tistim, ki izberejo isto.</span> Popolna diskretnost.
                    </p>
                </FadeIn>

                <div className="grid gap-4">
                    {FANTASIES.map((item, index) => (
                        <FadeIn key={item.id} delay={index * 0.1}>
                            <button
                                onClick={() => toggleFantasy(item.id)}
                                className={`w-full px-6 py-5 rounded-2xl border-2 text-left flex items-center justify-between transition-all duration-300 transform active:scale-95 ${selected.includes(item.id)
                                        ? "bg-purple-900/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                        : "bg-gray-800 border-gray-700 hover:border-gray-500"
                                    }`}
                            >
                                <span className="font-semibold text-lg">{item.label}</span>
                                {selected.includes(item.id) && <Flame className="text-pink-500 animate-pulse" />}
                            </button>
                        </FadeIn>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={handleSave}
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition transform hover:scale-105"
                    >
                        {isSaved ? "Shranjeno (Varno)" : "Shrani in Zakleni"}
                    </button>
                </div>

                <div className="mt-8 text-center opacity-40 text-sm flex items-center justify-center gap-2">
                    <EyeOff size={14} />
                    Vaši odgovori so šifrirani in zasebni.
                </div>
            </main>
        </div>
    );
}
