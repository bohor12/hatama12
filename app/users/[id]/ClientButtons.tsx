"use client";
import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClientButtons({ userId, initialIsLiked }: { userId: string, initialIsLiked: boolean }) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const router = useRouter();

    const handleLike = async () => {
        if (isLiked) return; // Already liked

        const res = await fetch("/api/interest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: userId })
        });

        if (res.ok) {
            setIsLiked(true);
            const data = await res.json();
            if (data.match) {
                alert("It's a Match! Lahko začneta klepetati.");
            }
        }
    };

    const handleMessage = () => {
        router.push(`/messages/chat/${userId}`);
    };

    return (
        <>
            <button
                onClick={handleLike}
                disabled={isLiked}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                    isLiked
                    ? "bg-gray-100 text-pink-600 cursor-default"
                    : "bg-white text-pink-600 border-2 border-pink-100 hover:bg-pink-50"
                }`}
            >
                <Heart className={isLiked ? "fill-current" : ""} />
                {isLiked ? "Všečkano" : "Všečkaj"}
            </button>

            <button
                onClick={handleMessage}
                className="flex-1 py-3 bg-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-pink-700 transition"
            >
                <MessageCircle />
                Pošlji sporočilo
            </button>
        </>
    );
}
