"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { pusherClient } from "@/lib/pusher";
import { toast } from "sonner";

export default function ChatRoom() {
    const { userId } = useParams(); // ID of the person we are talking to
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [myId, setMyId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Get Me (for ID and auth check)
        fetch("/api/user/me")
            .then((res) => {
                if (res.status === 401) router.push("/login");
                return res.json();
            })
            .then((data) => {
                setMyId(data.id);

                // 2. Subscribe to Pusher (Listening to MY channel for incoming messages)
                const channel = pusherClient.subscribe(`chat-${data.id}`);
                channel.bind("message:new", (message: any) => {
                    // Only add if it belongs to THIS active conversation
                    if (message.senderId === userId || message.receiverId === userId) {
                        setMessages((prev) => [...prev, message]);
                        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                    }
                });

                return () => {
                    pusherClient.unsubscribe(`chat-${data.id}`);
                };
            });

        // 3. Fetch History
        if (userId) {
            fetch(`/api/messages/${userId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setMessages(data);
                        setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
                    }
                });
        }
    }, [userId, router]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempContent = newMessage;
        setNewMessage(""); // Optimistic clear

        try {
            const res = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId, content: tempContent }),
            });

            if (!res.ok) throw new Error("Send failed");

            // We rely on Pusher to update the UI for consistency, OR we can optimistically append.
            // For standard chat, usually better to append immediately or wait for ack. 
            // Since we blindly listen to pusher, we might get double messages if we append here AND listen to pusher event (since we listen to chat-myId causing echo if backend sends to sender too).
            // Backend logic: await pusherServer.trigger(`chat-${senderId}`, 'message:new', message);
            // YES, backend sends to sender too. So we don't need to append manually here, just wait for the event.

        } catch (err) {
            toast.error("Napaka pri pošiljanju");
            setNewMessage(tempContent);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10">
                <Link href="/messages" className="text-gray-600 hover:text-pink-600 transition">
                    <ArrowLeft />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <h1 className="font-bold text-gray-800">Pogovor</h1>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderId === myId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? "bg-pink-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm"}`}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} />
            </main>

            {/* Input Area */}
            <footer className="bg-white p-4 border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-2 container mx-auto max-w-2xl">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napiši sporočilo..."
                        className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
}
