"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
    href: string;
    icon: LucideIcon;
    label: string;
    colorClass: string; // e.g. "text-blue-600 bg-blue-50"
}

export default function ActionCard({ href, icon: Icon, label, colorClass }: ActionCardProps) {
    return (
        <Link
            href={href}
            className={`group flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white/90 backdrop-blur-md shadow-md hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-transparent transform hover:-translate-y-1 ${colorClass} hover:bg-gradient-to-br`}
        >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} className="transition-colors duration-300" />
            </div>
            <span className="font-bold text-gray-800 text-sm tracking-wide uppercase group-hover:text-white transition-colors duration-300">{label}</span>
        </Link>
    );
}
