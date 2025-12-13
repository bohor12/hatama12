"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("F"); // Default to Female as per target audience focus
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, gender }),
    });

    if (res.ok) {
      router.push("/profile");
    } else {
      const data = await res.json();
      setError(data.error || "Registracija ni uspela");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Registracija</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Geslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 outline-none"
              required
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">Spol</label>
             <div className="mt-2 flex gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="gender" value="F" checked={gender === 'F'} onChange={(e) => setGender(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                 <span>Ženska</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="gender" value="M" checked={gender === 'M'} onChange={(e) => setGender(e.target.value)} className="text-pink-600 focus:ring-pink-500" />
                 <span>Moški</span>
               </label>
             </div>
          </div>
          <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded-lg font-bold hover:bg-pink-700 transition">
            Ustvari račun
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Že imate račun? <Link href="/login" className="text-pink-600 hover:underline">Prijavite se</Link>
        </p>
      </div>
    </div>
  );
}
