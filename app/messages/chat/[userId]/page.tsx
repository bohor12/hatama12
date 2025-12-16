"use client";
import { useState, useEffect, useRef } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import Navbar from "../../../components/Navbar";

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [recipient, setRecipient] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch Recipient Details
    useEffect(() => {
        fetch(`/api/users/${userId}`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => setRecipient(data));
    }, [userId]);

    // Fetch Messages
    useEffect(() => {
        const fetchMessages = () => {
             fetch(`/api/messages/${userId}`)
                .then(res => {
                    if (res.ok) return res.json();
                    return [];
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setMessages(data);
                    }
                });
        };

        fetchMessages();
        // Simple polling every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [userId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        // Optimistic UI (temporary ID)
        const tempId = Date.now().toString();

        setNewMessage("");

        try {
            const res = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: userId, content: newMessage })
            });

            if (res.ok) {
                // Refresh messages immediately
                const msgsRes = await fetch(`/api/messages/${userId}`);
                const msgs = await msgsRes.json();
                setMessages(msgs);
            } else {
                const data = await res.json();
                alert("Napaka pri pošiljanju: " + (data.error || "Neznana napaka"));
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // We need to know who is who.
    // The messages have senderId. We need to know "my" ID to align right.
    // We can fetch "me" or assume if senderId != recipient.id then it's me.

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
                <Link href="/messages" className="text-gray-600"><ArrowLeft /></Link>
                <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                        {recipient?.photos && JSON.parse(recipient.photos)[0] ? (
                             <img src={JSON.parse(recipient.photos)[0]} className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold">
                                 {recipient?.name ? recipient.name[0] : "?"}
                             </div>
                        )}
                     </div>
                     <div>
                        <h1 className="text-lg font-bold leading-none">{recipient?.name || "Uporabnik"}</h1>
                        <span className="text-xs text-green-500">Na spletu</span>
                     </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Začnite pogovor z {recipient?.name || "uporabnikom"}!</p>
                        <p className="text-xs">Bodite vljudni in spoštljivi.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        // If msg.senderId is the recipient's ID, it's on the left.
                        // Otherwise it's me (right).
                        const isMe = msg.senderId !== userId;

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${
                                    isMe
                                    ? 'bg-pink-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] opacity-70 block text-right mt-1 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="bg-white border-t p-4 pb-safe">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napiši sporočilo..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
}
