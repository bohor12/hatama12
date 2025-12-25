"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface DashboardCardProps {
    href: string;
    gradient: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
}

export default function DashboardCard({ href, gradient, icon, title, description, delay = 0 }: DashboardCardProps) {
    return (
        <Link
            href={href}
            className={`group relative overflow-hidden ${gradient} p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white block h-full`}
        >
            {/* Texture/Noise overlay for premium feel */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col items-center text-center h-full justify-between gap-6">

                {/* Icon Container with Glass Effect */}
                <div className="bg-white/20 p-5 rounded-2xl backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform duration-300 border border-white/10">
                    <div className="text-white">
                        {icon}
                    </div>
                </div>

                {/* Text Content */}
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2 drop-shadow-sm">{title}</h2>
                    <p className="text-white/90 font-medium text-sm leading-relaxed">{description}</p>
                </div>

                {/* Call to Action indicator */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    Odkrij <ArrowRight size={14} />
                </div>
            </div>

            {/* Shimmer on hover */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        </Link>
    );
}
