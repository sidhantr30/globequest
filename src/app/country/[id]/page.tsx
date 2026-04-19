"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import countriesData from "@/data/countries.json";
import quizzesData from "@/data/quizzes.json";
import CountryInfo from "@/components/CountryInfo";
import Quiz from "@/components/Quiz";
import Link from "next/link";

type CountryId = keyof typeof countriesData;

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showQuiz, setShowQuiz] = useState(false);

  const country = countriesData[id as CountryId];
  const quizQuestions = quizzesData[id as keyof typeof quizzesData];

  if (!country) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-3xl font-bold text-white mb-4">Country Not Found</h1>
        <p className="text-slate-400 mb-8">
          We haven&apos;t added this country yet. More coming soon!
        </p>
        <button
          onClick={() => router.push("/globe")}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all"
        >
          Back to Globe
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800 sticky top-0 z-10">
        <Link
          href="/globe"
          className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
        >
          GlobeQuest
        </Link>
        <button
          onClick={() => router.push("/globe")}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Back to Globe
        </button>
      </header>

      {showQuiz && quizQuestions ? (
        <Quiz
          countryName={country.name}
          countryFlag={country.flag}
          questions={quizQuestions}
          onBackToCountry={() => setShowQuiz(false)}
          onBackToGlobe={() => router.push("/globe")}
        />
      ) : (
        <CountryInfo
          country={country}
          onStartQuiz={() => setShowQuiz(true)}
          onBackToGlobe={() => router.push("/globe")}
        />
      )}
    </div>
  );
}
