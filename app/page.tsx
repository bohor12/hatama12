import Link from "next/link";
import { Heart, Shield, Lock, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 font-sans text-gray-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <Heart className="text-pink-600 w-8 h-8 fill-current" />
           <span className="text-2xl font-bold text-gray-900 tracking-tight">SloZmenki</span>
        </div>
        <nav>
          <Link href="/login" className="px-4 py-2 text-pink-600 font-medium hover:text-pink-700 transition">
            Prijava
          </Link>
          <Link href="/register" className="ml-4 px-6 py-2 bg-pink-600 text-white font-medium rounded-full shadow-lg hover:bg-pink-700 transition">
            Pridruži se
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Spoznaj nekoga,<br/> <span className="text-pink-600">kdor ti ustreza.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Prva slovenska platforma, kjer imajo ženske popoln nadzor. 
          Varno, diskretno in prilagojeno tvojim željam.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
           <Link href="/register" className="px-8 py-4 bg-pink-600 text-white text-lg font-bold rounded-full shadow-xl hover:bg-pink-700 hover:scale-105 transition transform">
             Ustvari Brezplačen Profil
           </Link>
           <Link href="/about" className="px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-full shadow-md hover:bg-gray-50 transition border border-gray-200">
             Kako deluje?
           </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-pink-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Popolna Varnost</h3>
            <p className="text-gray-500">
              Preverjeni profili in strogi varnostni protokoli zagotavljajo brezskrbno spoznavanje.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-purple-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Vaša Pravila</h3>
            <p className="text-gray-500">
              Sami določite, kdo vam lahko piše. Napredni filtri preprečijo neželena sporočila.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Diskretna Komunikacija</h3>
            <p className="text-gray-500">
              Klepetajte varno. Glasovni klici so mogoči le, če jih vi odobrite.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center text-gray-500 text-sm">
        © 2024 SloZmenki. Vse pravice pridržane.
      </footer>
    </div>
  );
}
