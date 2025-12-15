"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, User } from "lucide-react";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Domov", icon: Home },
    { href: "/browse", label: "Išči", icon: Search },
    { href: "/messages", label: "Sporočila", icon: MessageCircle },
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <>
      {/* Desktop Navbar (Top) */}
      <nav className="hidden md:flex bg-white shadow-sm sticky top-0 z-50 border-b border-pink-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
             <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SZ</span>
             </div>
             <span className="text-xl font-bold text-gray-900 tracking-tight">SloZmenki</span>
          </Link>

          <div className="flex gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/browse" && pathname.startsWith("/browse"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium",
                    isActive
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-600 hover:text-pink-600 hover:bg-gray-50"
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
             const Icon = item.icon;
             const isActive = pathname === item.href || (item.href === "/browse" && pathname.startsWith("/browse"));
             return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={clsx(
                   "flex flex-col items-center justify-center gap-1",
                   isActive ? "text-pink-600" : "text-gray-500 hover:text-pink-500"
                 )}
               >
                 <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                 <span className="text-[10px] font-medium">{item.label}</span>
               </Link>
             );
          })}
        </div>
      </nav>
      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </>
  );
}
