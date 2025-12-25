"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Search, MessageCircle, FileText, Users, Flame, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import FadeIn from "../components/ui/FadeIn";
import DashboardCard from "../components/dashboard/DashboardCard";
import ActionCard from "../components/dashboard/ActionCard";
import SmartMatchList from "../components/dashboard/SmartMatchList";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [interests, setInterests] = useState<any[]>([]);

    useEffect(() => {
        // Fetch User
        fetch("/api/user/me").then(res => {
            if (res.status === 401) router.push("/login");
            return res.json();
        }).then(data => setUser(data));

        // Fetch Incoming Interests
        fetch("/api/interest").then(res => res.json()).then(data => {
            if (Array.isArray(data)) setInterests(data);
        });
    }, [router]);

    const handleApprove = async (interestId: string) => {
        const res = await fetch("/api/interest/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interestId })
        });

        if (res.ok) {
            toast.success("Odobreno! Zdaj si lahko pišeta.", {
                description: "Pojdi v sporočila in začni klepet.",
            });
            setInterests(prev => prev.filter(i => i.id !== interestId));
        } else {
            toast.error("Napaka pri potrditvi.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <FadeIn direction="down" delay={0.1} className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Pozdravljeni, {user?.name || "uporabnik"}! 👋</h1>
                    <Link href="/profile/preferences" className="text-pink-600 hover:underline font-semibold text-sm">
                        ⚙️ Nastavi Preference (Algoritem)
                    </Link>
                </FadeIn>

                {/* Smart Matches Recommendation */}
                <div className="mb-12">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="text-yellow-500" />
                        Priporočamo zate
                    </h3>
                    <SmartMatchList />
                </div>

                {/* Primary Actions - Gender Search */}
                {/* New Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Love - Traditional */}
                    <FadeIn delay={0.2} direction="up">
                        <DashboardCard
                            href="/browse"
                            gradient="bg-gradient-to-br from-pink-600 via-rose-500 to-red-600"
                            icon={<Heart size={100} />}
                            title="Ljubezen"
                            description="Resno iskanje partnerja."
                        />
                    </FadeIn>

                    {/* Sex / Fun - Swipe */}
                    <FadeIn delay={0.3} direction="up">
                        <DashboardCard
                            href="/swipe"
                            gradient="bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-700"
                            icon={<Flame size={100} />}
                            title="Avantura"
                            description="Vroče ali ne? (Swipe)"
                        />
                    </FadeIn>

                    {/* Secret Desires - Kinks */}
                    <FadeIn delay={0.4} direction="up">
                        <DashboardCard
                            href="/secret-desires"
                            gradient="bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700"
                            icon={<Lock size={100} />}
                            title="Fantazije"
                            description="Poveži se preko skritih želja."
                        />
                    </FadeIn>
                </div>

                {/* Blind Date Banner */}
                <FadeIn delay={0.5} className="mb-12">
                    <Link href="/blind-date" className="block relative bg-gradient-to-r from-indigo-900 to-blue-900 p-8 rounded-3xl shadow-xl overflow-hidden group">
                        <div className="absolute right-0 top-0 h-full w-1/2 bg-blue-500/10 transform skew-x-12"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="bg-white/10 p-4 rounded-full backdrop-blur-md">
                                <Users size={32} className="text-blue-200" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                    Zmenek na Slepo <ShieldCheck size={18} className="text-green-400" />
                                </h3>
                                <p className="text-blue-200">Varno spoznavanje za verificirane uporabnike.</p>
                            </div>
                        </div>
                    </Link>
                </FadeIn>

                {/* Secondary Actions */}
                <FadeIn delay={0.4} direction="up">
                    <div className="grid grid-cols-3 gap-4 mb-12">
                        <ActionCard
                            href="/messages"
                            icon={MessageCircle}
                            label="Sporočila"
                            colorClass="text-blue-600 from-blue-500 to-cyan-400"
                        />
                        <ActionCard
                            href="/rooms"
                            icon={Users}
                            label="Sobe"
                            colorClass="text-green-600 from-emerald-500 to-teal-400"
                        />
                        <ActionCard
                            href="/ads"
                            icon={FileText}
                            label="Oglasi"
                            colorClass="text-purple-600 from-violet-500 to-fuchsia-400"
                        />
                    </div>
                </FadeIn>

                {/* Incoming Interests (Only visible if any) */}
                {interests.length > 0 && (
                    <FadeIn delay={0.5} direction="up" className="bg-white p-6 rounded-3xl shadow-lg border border-pink-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
                            <Heart className="text-pink-600 fill-current w-6 h-6 animate-pulse" />
                            Nova Zanimanja <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{interests.length}</span>
                        </h2>
                        <div className="space-y-3">
                            {interests.map((interest) => (
                                <div key={interest.id} className="flex items-center justify-between p-4 bg-pink-50/50 rounded-2xl hover:bg-pink-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                            {/* Placeholder avatar */}
                                            <div className="w-full h-full bg-gray-300"></div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{interest.sender.name || "Neznanec"}</p>
                                            <p className="text-xs text-gray-500">{interest.sender.location || "Slovenija"}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleApprove(interest.id)}
                                        className="px-5 py-2.5 bg-pink-600 text-white text-sm font-bold rounded-xl hover:bg-pink-700 transition shadow-md shadow-pink-200"
                                    >
                                        Odobri
                                    </button>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                )}
            </main>
        </div>
    );
}
