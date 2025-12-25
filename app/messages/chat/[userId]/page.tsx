"use client";
import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { icebreakers } from "@/lib/icebreakers";

export default function Chat({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [otherUser, setOtherUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showIcebreakers, setShowIcebreakers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch user info & messages
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Info
                const userRes = await fetch(`/api/users/${userId}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setOtherUser(userData);
                }

                // Fetch Messages
                const msgRes = await fetch(`/api/messages/${userId}`);
                if (msgRes.status === 401) {
                     router.push("/login");
                     return;
                }
                if (msgRes.ok) {
                    const msgData = await msgRes.json();
                    setMessages(msgData);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Polling for new messages (simple implementation)
        const interval = setInterval(() => {
            fetch(`/api/messages/${userId}`)
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                    if (Array.isArray(data)) setMessages(data);
                });
        }, 5000);

        return () => clearInterval(interval);
    }, [userId, router]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: userId,
                    content: newMessage
                })
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages([...messages, sentMsg]);
                setNewMessage("");
            } else {
                const err = await res.json();
                alert(err.error || "Napaka pri pošiljanju.");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleIcebreaker = (question: string) => {
        setNewMessage(question);
        setShowIcebreakers(false);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Nalaganje...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-10">
                <Link href="/messages" className="text-gray-600 hover:text-pink-600">
                    <ArrowLeft />
                </Link>
                {otherUser && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                             {/* Small thumbnail if available */}
                             {otherUser.photos && (
                                 <img src={JSON.parse(otherUser.photos)[0]} className="w-full h-full object-cover" />
                             )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-gray-900">{otherUser.name}</h1>
                                {otherUser.verificationStatus === 'APPROVED' && (
                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                            </div>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Online
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        <p>Začnite pogovor z {otherUser?.name || "osebo"}.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId !== userId; // if sender is NOT the other user, it's me.
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm text-sm ${
                                    isMe 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                }`}>
                                    <p>{msg.content}</p>
                                    <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="bg-white p-4 border-t border-gray-200">
                <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
                    <button 
                        type="button"
                        onClick={() => setShowIcebreakers(!showIcebreakers)}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-3 rounded-full transition"
                    >
                        <Sparkles size={20} />
                    </button>
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napiši sporočilo..."
                        className="flex-1 bg-gray-100 border-0 rounded-full px-6 py-3 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>

            {/* Icebreaker Popup */}
            {showIcebreakers && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={() => setShowIcebreakers(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                            <Sparkles size={24} />
                            Ledolomilci
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">Kliknite na vprašanje, da ga uporabite:</p>
                        <div className="space-y-2">
                            {icebreakers.map((q, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleIcebreaker(q)}
                                    className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition border border-purple-100"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
