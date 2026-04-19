"use client";

interface CountryData {
  name: string;
  continent: string;
  capital: string;
  largestCity: string;
  population: string;
  language: string;
  currency: string;
  flag: string;
  famousFor: string;
  history: string[];
  trivia: string[];
}

interface CountryInfoProps {
  country: CountryData;
  onStartQuiz: () => void;
  onBackToGlobe: () => void;
}

export default function CountryInfo({ country, onStartQuiz, onBackToGlobe }: CountryInfoProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">{country.flag}</div>
        <h1 className="text-4xl font-bold text-white mb-1">{country.name}</h1>
        <p className="text-cyan-400 text-lg">{country.continent}</p>
      </div>

      {/* Quick Facts */}
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Quick Facts</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Capital", value: country.capital },
            { label: "Largest City", value: country.largestCity },
            { label: "Population", value: country.population },
            { label: "Language", value: country.language },
            { label: "Currency", value: country.currency },
          ].map((fact) => (
            <div key={fact.label} className="bg-slate-900/50 rounded-xl p-3">
              <div className="text-slate-400 text-xs uppercase tracking-wide">{fact.label}</div>
              <div className="text-white font-medium">{fact.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Famous For */}
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
        <h2 className="text-xl font-bold text-purple-400 mb-3">Famous For</h2>
        <p className="text-slate-200 text-lg">{country.famousFor}</p>
      </div>

      {/* History */}
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
        <h2 className="text-xl font-bold text-amber-400 mb-4">History Highlights</h2>
        <ul className="space-y-3">
          {country.history.map((fact, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-amber-400 font-bold mt-0.5">&#9670;</span>
              <span className="text-slate-200">{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Trivia */}
      <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-700">
        <h2 className="text-xl font-bold text-green-400 mb-4">Did You Know?</h2>
        <ul className="space-y-3">
          {country.trivia.map((fact, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-green-400 font-bold mt-0.5">&#9733;</span>
              <span className="text-slate-200">{fact}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onBackToGlobe}
          className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-full hover:bg-slate-600 transition-colors"
        >
          Back to Globe
        </button>
        <button
          onClick={onStartQuiz}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/25"
        >
          Take the Quiz!
        </button>
      </div>
    </div>
  );
}
