"use client";
import React from 'react';
import { X, MapPin, Briefcase, GraduationCap, Heart, Check } from 'lucide-react';

interface ProfilePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    userData: {
        name: string;
        photos: string[];
        height: string;
        birthDate: string;
        isSmoker: boolean;
        hairColor: string;
        eyeColor: string;
        bodyType: string;
        relationshipType: string;
        hasChildren: boolean | null;
        wantsChildren: boolean | null;
        education: string;
        occupation: string;
        region?: string;
        isVerified?: boolean;
        personalTraits?: string[];
    };
}

export default function ProfilePreview({ isOpen, onClose, userData }: ProfilePreviewProps) {
    if (!isOpen) return null;

    // Calculate age from birthDate
    const calculateAge = (birthDate: string) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge(userData.birthDate);
    const mainPhoto = userData.photos[0] || '/placeholder-avatar.png';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                >
                    <X size={20} />
                </button>

                {/* Header label */}
                <div className="absolute top-4 left-4 z-20 bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    👁️ Tako te vidijo drugi
                </div>

                {/* Photo carousel */}
                <div className="relative h-80 bg-gray-200">
                    <img
                        src={mainPhoto}
                        alt={userData.name || 'Profil'}
                        className="w-full h-full object-cover"
                    />

                    {/* Photo indicators */}
                    {userData.photos.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {userData.photos.slice(0, 5).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Name and age on photo */}
                    <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">{userData.name || 'Uporabnik'}</h2>
                            {age && <span className="text-xl font-light">{age}</span>}
                            {userData.isVerified && (
                                <span className="bg-blue-500 p-1 rounded-full">
                                    <Check size={12} className="text-white" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[50vh] overflow-y-auto">
                    {/* Quick info row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {userData.height && (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                                📏 {userData.height} cm
                            </span>
                        )}
                        {userData.bodyType && (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                                💪 {userData.bodyType}
                            </span>
                        )}
                        {userData.isSmoker !== undefined && (
                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                                {userData.isSmoker ? '🚬 Kadilec' : '🚭 Nekadilec'}
                            </span>
                        )}
                    </div>

                    {/* Physical attributes */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {userData.hairColor && (
                            <div className="bg-pink-50 p-3 rounded-xl">
                                <p className="text-xs text-gray-500">💇 Lasje</p>
                                <p className="font-medium text-gray-800">{userData.hairColor}</p>
                            </div>
                        )}
                        {userData.eyeColor && (
                            <div className="bg-blue-50 p-3 rounded-xl">
                                <p className="text-xs text-gray-500">👁️ Oči</p>
                                <p className="font-medium text-gray-800">{userData.eyeColor}</p>
                            </div>
                        )}
                    </div>

                    {/* Lifestyle */}
                    <div className="space-y-2 mb-4">
                        {userData.relationshipType && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Heart size={16} className="text-pink-500" />
                                <span className="text-sm">{userData.relationshipType}</span>
                            </div>
                        )}
                        {userData.occupation && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Briefcase size={16} className="text-purple-500" />
                                <span className="text-sm">{userData.occupation}</span>
                            </div>
                        )}
                        {userData.education && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <GraduationCap size={16} className="text-blue-500" />
                                <span className="text-sm">{userData.education}</span>
                            </div>
                        )}
                    </div>

                    {/* Children info */}
                    {(userData.hasChildren !== null || userData.wantsChildren !== null) && (
                        <div className="bg-amber-50 p-3 rounded-xl mb-4">
                            <div className="flex flex-wrap gap-3">
                                {userData.hasChildren !== null && (
                                    <span className="text-sm text-gray-700">
                                        👶 {userData.hasChildren ? 'Imam otroke' : 'Nimam otrok'}
                                    </span>
                                )}
                                {userData.wantsChildren !== null && (
                                    <span className="text-sm text-gray-700">
                                        🍼 {userData.wantsChildren ? 'Želim otroke' : 'Ne želim otrok'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Traits */}
                    {userData.personalTraits && userData.personalTraits.length > 0 && userData.personalTraits.some(t => t) && (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">✨ O meni</p>
                            <div className="flex flex-wrap gap-2">
                                {userData.personalTraits.filter(t => t).map((trait, idx) => (
                                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="bg-gray-50 p-4 text-center border-t">
                    <p className="text-xs text-gray-500">
                        💡 Izpolni več polj, da bo tvoj profil bolj privlačen!
                    </p>
                </div>
            </div>
        </div>
    );
}
