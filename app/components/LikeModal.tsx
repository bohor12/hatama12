"use client";
import React, { useState } from 'react';
import { Heart, MessageCircle, X, Send } from 'lucide-react';

interface LikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (allowMessage: boolean, inviteMessage?: string) => void;
    userName: string;
}

export default function LikeModal({ isOpen, onClose, onConfirm, userName }: LikeModalProps) {
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [customMessage, setCustomMessage] = useState("");

    if (!isOpen) return null;

    const handleJustLike = () => {
        onConfirm(false);
        resetAndClose();
    };

    const handleLikeWithInvite = () => {
        if (showMessageInput) {
            // Submit with message
            onConfirm(true, customMessage || "Piši mi! 💬");
            resetAndClose();
        } else {
            // Show message input
            setShowMessageInput(true);
        }
    };

    const resetAndClose = () => {
        setShowMessageInput(false);
        setCustomMessage("");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetAndClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
                {/* Close button */}
                <button onClick={resetAndClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-pink-500" size={32} fill="currentColor" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Všeč ti je {userName}! 💜</h2>
                    <p className="text-gray-500 text-sm mt-1">Kako želiš pokazati zanimanje?</p>
                </div>

                {/* Options */}
                {!showMessageInput ? (
                    <div className="space-y-3">
                        {/* Just Like */}
                        <button
                            onClick={handleJustLike}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition group"
                        >
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition">
                                <Heart className="text-pink-500" size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800">Samo Like</p>
                                <p className="text-xs text-gray-500">Pošlji spodbudo, brez direktnega povabila</p>
                            </div>
                        </button>

                        {/* Like with Invite */}
                        <button
                            onClick={handleLikeWithInvite}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 transition group"
                        >
                            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center group-hover:bg-purple-300 transition">
                                <MessageCircle className="text-purple-600" size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-gray-800">Like + Povabi k Pisanju</p>
                                <p className="text-xs text-gray-500">Sporočilo gre v tvojo glavno mapo</p>
                            </div>
                            <span className="ml-auto text-purple-600 font-bold text-sm">✨</span>
                        </button>
                    </div>
                ) : (
                    /* Message Input */
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                            <label className="block text-sm font-bold text-purple-800 mb-2">
                                Tvoje sporočilo (opcijsko):
                            </label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Piši mi! Zdiš se zanimiv... 💬"
                                maxLength={100}
                                rows={2}
                                className="w-full bg-white border border-purple-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                            />
                            <p className="text-xs text-purple-600 mt-1 text-right">{customMessage.length}/100</p>
                        </div>

                        <button
                            onClick={handleLikeWithInvite}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                        >
                            <Send size={20} /> Pošlji Like s Povabilom
                        </button>
                    </div>
                )}

                {/* Explanation */}
                <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 text-center">
                        💡 <strong>Nasvet:</strong> Ko povabi, lahko on piše direktno v tvojo glavno mapo.
                        Sicer gredo njegova sporočila v "Ostala".
                    </p>
                </div>
            </div>
        </div>
    );
}
