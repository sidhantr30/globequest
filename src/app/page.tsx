import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="mb-8 text-8xl">🌍</div>
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
        GlobeQuest
      </h1>
      <p className="text-xl text-slate-300 mb-2 max-w-md">
        Spin the globe. Click a country. Discover amazing history!
      </p>
      <p className="text-sm text-slate-500 mb-10">
        Quiz yourself and learn cool facts about countries around the world
      </p>
      <Link
        href="/globe"
        className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105"
      >
        Start Exploring
      </Link>
    </main>
  );
}
