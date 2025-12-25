"use client";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import FadeIn from "../components/ui/FadeIn";

export default function BlindDate() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white flex flex-col items-center justify-center p-6 text-center">
            <Link href="/dashboard" className="absolute top-6 left-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                <ArrowLeft />
            </Link>

            <FadeIn>
                <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-indigo-500/50">
                    <Lock size={48} className="text-indigo-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Zmenek na Slepo</h1>
                <p className="text-xl text-gray-300 max-w-md mx-auto mb-8">
                    Spoznaj osebo preko pogovora, preden vidiš njeno sliko.
                </p>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl max-w-sm mx-auto backdrop-blur-sm">
                    <ShieldCheck size={32} className="mx-auto text-green-400 mb-2" />
                    <h3 className="font-bold text-lg mb-2">Samo za Verificirane</h3>
                    <p className="text-sm text-gray-400 mb-6">
                        Zaradi zagotavljanja varnosti je ta funkcija na voljo le uporabnikom, ki so potrdili svojo identiteto.
                    </p>
                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition">
                        Verificiraj se (ID)
                    </button>
                </div>
            </FadeIn>
        </div>
    );
}
