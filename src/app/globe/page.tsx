"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Globe from "@/components/Globe";
import Link from "next/link";

export default function GlobePage() {
  const router = useRouter();

  const handleCountryClick = useCallback(
    (countryId: string) => {
      router.push(`/country/${countryId}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          GlobeQuest
        </Link>
        <p className="text-slate-400 text-sm hidden sm:block">
          Click a highlighted country to explore!
        </p>
      </header>
      <main className="flex-1 overflow-hidden">
        <Globe onCountryClick={handleCountryClick} />
      </main>
    </div>
  );
}
