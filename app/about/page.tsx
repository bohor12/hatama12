import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 font-sans text-gray-800">
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-8">
           <Heart className="text-pink-600 w-8 h-8 fill-current" />
           <span className="text-2xl font-bold text-gray-900 tracking-tight">SloZmenki</span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl bg-white p-10 rounded-2xl shadow-xl">
        <Link href="/" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 font-medium transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazaj na prvo stran
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Kako deluje SloZmenki?</h1>
        
        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
          <p>
            SloZmenki je platforma, zasnovana z mislijo na varnost in udobje, predvsem za ženske.
            Verjamemo, da mora spoznavanje potekati pod vašimi pogoji.
          </p>
          
          <h2 className="text-2xl font-bold text-pink-600 mt-8">Naša filozofija</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Popoln nadzor:</strong> Vi določite, kdo vas lahko kontaktira.</li>
            <li><strong>Diskretnost:</strong> Vaši podatki so varni, klici so mogoči le z dovoljenjem.</li>
            <li><strong>Brez nadlegovanja:</strong> Strogi filtri preprečujejo neželena sporočila.</li>
          </ul>

          <h2 className="text-2xl font-bold text-purple-600 mt-8">Kako začeti?</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Ustvarite brezplačen profil.</li>
            <li>Nastavite svoje preference in varnostne filtre.</li>
            <li>Brskajte po profilih in začnite klepet z osebami, ki vam ustrezajo.</li>
          </ol>
        </div>
        
        <div className="mt-10 text-center">
            <Link href="/register" className="px-8 py-4 bg-pink-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-pink-700 transition">
                Pridruži se zdaj
            </Link>
        </div>
      </main>
      
      <footer className="py-8 text-center text-gray-500 text-sm mt-8">
        © 2024 SloZmenki. Vse pravice pridržane.
      </footer>
    </div>
  );
}
