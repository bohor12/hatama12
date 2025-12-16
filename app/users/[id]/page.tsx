import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import { Heart, MessageCircle, MapPin, Ruler, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientButtons from "./ClientButtons";

// Helper to parse photos
const parsePhotos = (photos: string | null) => {
    try {
        if (photos) {
            const parsed = JSON.parse(photos);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (e) {
        return [];
    }
    return [];
};

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
         redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: id },
        include: {
           receivedInterests: {
               where: { senderId: currentUser.id }
           }
        }
    });

    if (!user) {
        notFound();
    }

    const photos = parsePhotos(user.photos);
    const mainPhoto = photos.length > 0 ? photos[0] : '/placeholder.png';
    const otherPhotos = photos.slice(1);

    // Check match status
    const myInterest = user.receivedInterests[0];
    const isLiked = !!myInterest;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="relative h-96 w-full">
                <img src={mainPhoto} alt={user.name || "User"} className="w-full h-full object-cover" />
                <Link href="/browse" className="absolute top-4 left-4 p-2 bg-black/30 text-white rounded-full backdrop-blur-md hover:bg-black/50 transition">
                    <ArrowLeft />
                </Link>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 to-transparent p-6 pt-20">
                    <h1 className="text-4xl font-bold text-white mb-1">{user.name}, <span className="text-3xl font-normal opacity-90">{user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : ""}</span></h1>
                    <div className="flex items-center text-gray-200 gap-2">
                        <MapPin size={16} />
                        <span>{user.location || "Slovenija"}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                    <ClientButtons userId={user.id} initialIsLiked={isLiked} />
                </div>

                {/* About Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">O Meni</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {user.bio || "Uporabnik še ni napisal opisa."}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Ruler className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Višina</p>
                                <p className="font-semibold">{user.height ? `${user.height} cm` : "-"}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Starost</p>
                                <p className="font-semibold">{user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : "-"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                {otherPhotos.length > 0 && (
                     <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Galerija</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {otherPhotos.map((url: string, idx: number) => (
                                <img key={idx} src={url} alt={`Photo ${idx+2}`} className="w-full h-48 object-cover rounded-lg" />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
