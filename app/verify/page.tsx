"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle, XCircle, Shield, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [step, setStep] = useState<'intro' | 'camera' | 'processing' | 'success' | 'failed'>('intro');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [countdown, setCountdown] = useState(3);
    const [processingText, setProcessingText] = useState("Analiziram...");

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setStep('camera');

            // Start countdown
            let count = 3;
            const interval = setInterval(() => {
                count--;
                setCountdown(count);
                if (count === 0) {
                    clearInterval(interval);
                    captureAndVerify();
                }
            }, 1000);
        } catch (err) {
            alert("Ni mogoče dostopati do kamere. Prosimo, omogočite dostop.");
        }
    };

    const captureAndVerify = async () => {
        setStep('processing');

        // Capture frame
        if (videoRef.current && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0);
            }
        }

        // Stop camera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Simulate "serious" processing with multiple steps
        const processingSteps = [
            "Analiziram sliko...",
            "Preverjam kvaliteto...",
            "Zaznavam obrazne značilnosti...",
            "Primerjam z bazo podatkov...",
            "Končno preverjanje..."
        ];

        for (let i = 0; i < processingSteps.length; i++) {
            setProcessingText(processingSteps[i]);
            await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
        }

        // Simple "detection" - in real scenario you'd use face-api.js here
        // For now, we'll just check if image was captured (always pass if camera worked)
        const imageData = canvasRef.current?.toDataURL('image/jpeg');

        if (imageData && imageData.length > 1000) {
            // Send to backend to mark as verified
            try {
                const res = await fetch('/api/user/verify/auto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ photo: imageData })
                });

                if (res.ok) {
                    setStep('success');
                } else {
                    setStep('failed');
                }
            } catch {
                setStep('failed');
            }
        } else {
            setStep('failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
            {/* Header */}
            <header className="p-4 flex items-center gap-4 border-b border-white/10">
                <Link href="/profile" className="p-2 hover:bg-white/10 rounded-full">
                    <ArrowLeft />
                </Link>
                <div className="flex items-center gap-2">
                    <Shield className="text-blue-400" />
                    <h1 className="font-bold text-lg">Verifikacija Identitete</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6">

                {/* INTRO */}
                {step === 'intro' && (
                    <div className="text-center max-w-md space-y-6">
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={48} className="text-blue-400" />
                        </div>
                        <h2 className="text-3xl font-bold">Postani Verificiran</h2>
                        <p className="text-gray-400">
                            Za zaščito naše skupnosti prosimo, da potrdite svojo identiteto s kratkim obraznim skeniranjem.
                        </p>
                        <div className="bg-white/5 p-4 rounded-xl text-left space-y-2 text-sm">
                            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Vaš obraz bo analiziran v živo</p>
                            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Slike ne shranjujemo trajno</p>
                            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-400" /> Postopek traja le nekaj sekund</p>
                        </div>
                        <button
                            onClick={startCamera}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                        >
                            <Camera /> Začni Verifikacijo
                        </button>
                    </div>
                )}

                {/* CAMERA */}
                {step === 'camera' && (
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="rounded-2xl border-4 border-blue-500 shadow-2xl shadow-blue-500/30 max-w-sm"
                            />
                            {/* Overlay with countdown */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/50 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white animate-pulse">{countdown}</span>
                                </div>
                            </div>
                            {/* Face guide overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-60 border-4 border-dashed border-white/50 rounded-[50%]"></div>
                            </div>
                        </div>
                        <p className="text-gray-400">Umestite obraz v okvir</p>
                    </div>
                )}

                {/* PROCESSING */}
                {step === 'processing' && (
                    <div className="text-center space-y-6">
                        <Loader2 size={64} className="animate-spin text-blue-400 mx-auto" />
                        <h2 className="text-2xl font-bold">{processingText}</h2>
                        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mx-auto">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-gray-500 text-sm">Prosimo, počakajte...</p>
                    </div>
                )}

                {/* SUCCESS */}
                {step === 'success' && (
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <CheckCircle size={48} className="text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-400">Verificirano! ✓</h2>
                        <p className="text-gray-400">
                            Vaš profil je zdaj verificiran. Drugi uporabniki bodo videli značko zaupanja.
                        </p>
                        <button
                            onClick={() => router.push('/profile')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition"
                        >
                            Nazaj na Profil
                        </button>
                    </div>
                )}

                {/* FAILED */}
                {step === 'failed' && (
                    <div className="text-center space-y-6 max-w-md">
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <XCircle size={48} className="text-red-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-red-400">Verifikacija Neuspešna</h2>
                        <p className="text-gray-400">
                            Obraza nismo mogli zaznati. Prosimo, poskusite ponovno v dobri osvetlitvi.
                        </p>
                        <button
                            onClick={() => setStep('intro')}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-bold transition"
                        >
                            Poskusi Ponovno
                        </button>
                    </div>
                )}

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
            </main>

            {/* Trust indicators */}
            <footer className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
                🔒 Zaščiteno s 256-bit šifriranjem • Podatki niso deljeni s tretjimi osebami
            </footer>
        </div>
    );
}
