"use client";

import CountryFlag from "./CountryFlag";

interface CountryData {
  name: string;
  continent: string;
  capital: string;
  largestCity: string;
  population: string;
  language: string;
  currency: string;
  flag: string;
  flagDescription: string;
  nationalAnimal: string;
  nationalSport: string;
  famousFor: string;
  landmarks: string[];
  geography: { longestRiver: string; tallestPeak: string };
  famousFood: string[];
  festivals: string[];
  famousPeople: string[];
  inventions: string[];
  worldRecords: string[];
  weirdLaws: string[];
  uniqueAnimals: string[];
  sportsAchievements: string[];
  history: string[];
  trivia: string[];
}

interface CountryInfoProps {
  country: CountryData;
  onStartQuiz: () => void;
  onBackToGlobe: () => void;
}

function Section({ title, color, icon, children }: { title: string; color: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
      <h2 className={`text-xl font-bold ${color} mb-4 flex items-center gap-2`}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function BulletList({ items, icon, color }: { items: string[]; icon: string; color: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className={`${color} mt-0.5 flex-shrink-0`}>{icon}</span>
          <span className="text-slate-200">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CountryInfo({ country, onStartQuiz, onBackToGlobe }: CountryInfoProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-3"><CountryFlag emoji={country.flag} size={64} /></div>
        <h1 className="text-4xl font-bold text-white mb-1">{country.name}</h1>
        <p className="text-cyan-400 text-lg">{country.continent}</p>
      </div>

      {/* Quick Facts */}
      <Section title="Quick Facts" color="text-cyan-400" icon="&#9432;">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Capital", value: country.capital },
            { label: "Largest City", value: country.largestCity },
            { label: "Population", value: country.population },
            { label: "Language", value: country.language },
            { label: "Currency", value: country.currency },
            { label: "National Animal", value: country.nationalAnimal },
            { label: "National Sport", value: country.nationalSport },
          ].map((fact) => (
            <div key={fact.label} className="bg-slate-900/50 rounded-xl p-3">
              <div className="text-slate-400 text-xs uppercase tracking-wide">{fact.label}</div>
              <div className="text-white font-medium">{fact.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Flag */}
      <Section title="Flag" color="text-pink-400" icon="&#127988;">
        <p className="text-slate-200">{country.flagDescription}</p>
      </Section>

      {/* Famous For */}
      <Section title="Famous For" color="text-purple-400" icon="&#11088;">
        <p className="text-slate-200 text-lg">{country.famousFor}</p>
      </Section>

      {/* Geography */}
      <Section title="Geography" color="text-emerald-400" icon="&#9968;">
        <div className="space-y-3">
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Longest/Largest River</div>
            <div className="text-slate-200">{country.geography.longestRiver}</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Tallest Peak</div>
            <div className="text-slate-200">{country.geography.tallestPeak}</div>
          </div>
        </div>
      </Section>

      {/* Landmarks */}
      {country.landmarks.length > 0 && (
        <Section title="Famous Landmarks" color="text-orange-400" icon="&#127963;">
          <BulletList items={country.landmarks} icon="&#9670;" color="text-orange-400" />
        </Section>
      )}

      {/* History */}
      <Section title="History Highlights" color="text-amber-400" icon="&#128220;">
        <BulletList items={country.history} icon="&#9670;" color="text-amber-400" />
      </Section>

      {/* Cool Trivia */}
      <Section title="Did You Know?" color="text-green-400" icon="&#128161;">
        <BulletList items={country.trivia} icon="&#9733;" color="text-green-400" />
      </Section>

      {/* Famous Food */}
      {country.famousFood.length > 0 && (
        <Section title="Famous Food" color="text-red-400" icon="&#127837;">
          <BulletList items={country.famousFood} icon="&#9670;" color="text-red-400" />
        </Section>
      )}

      {/* Festivals */}
      {country.festivals.length > 0 && (
        <Section title="Famous Festivals" color="text-yellow-400" icon="&#127878;">
          <BulletList items={country.festivals} icon="&#9670;" color="text-yellow-400" />
        </Section>
      )}

      {/* Famous People */}
      {country.famousPeople.length > 0 && (
        <Section title="Famous People" color="text-blue-400" icon="&#127942;">
          <BulletList items={country.famousPeople} icon="&#9670;" color="text-blue-400" />
        </Section>
      )}

      {/* Inventions */}
      {country.inventions.length > 0 && (
        <Section title="Famous Inventions" color="text-violet-400" icon="&#128300;">
          <BulletList items={country.inventions} icon="&#9670;" color="text-violet-400" />
        </Section>
      )}

      {/* World Records */}
      {country.worldRecords.length > 0 && (
        <Section title="World Records" color="text-rose-400" icon="&#127941;">
          <BulletList items={country.worldRecords} icon="&#9670;" color="text-rose-400" />
        </Section>
      )}

      {/* Unique Animals */}
      {country.uniqueAnimals.length > 0 && (
        <Section title="Unique Animals" color="text-lime-400" icon="&#128062;">
          <BulletList items={country.uniqueAnimals} icon="&#9670;" color="text-lime-400" />
        </Section>
      )}

      {/* Weird Laws */}
      {country.weirdLaws.length > 0 && (
        <Section title="Weird Laws" color="text-fuchsia-400" icon="&#9878;">
          <BulletList items={country.weirdLaws} icon="&#9670;" color="text-fuchsia-400" />
        </Section>
      )}

      {/* Sports Achievements */}
      {country.sportsAchievements.length > 0 && (
        <Section title="Sports Achievements" color="text-sky-400" icon="&#127947;">
          <BulletList items={country.sportsAchievements} icon="&#9670;" color="text-sky-400" />
        </Section>
      )}

      {/* Buttons */}
      <div className="flex gap-4 justify-center pt-4">
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
