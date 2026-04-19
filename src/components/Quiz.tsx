"use client";

import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizProps {
  countryName: string;
  countryFlag: string;
  questions: QuizQuestion[];
  onBackToCountry: () => void;
  onBackToGlobe: () => void;
}

export default function Quiz({ countryName, countryFlag, questions, onBackToCountry, onBackToGlobe }: QuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const question = questions[currentQ];
  const isCorrect = selectedAnswer === question.correct;
  const isFinished = showResult;

  function handleAnswer(index: number) {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === question.correct) {
      setScore(score + 1);
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  }

  function handleRetry() {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    if (percentage === 100) message = "Perfect score! You're a genius!";
    else if (percentage >= 80) message = "Amazing job! You really know your stuff!";
    else if (percentage >= 60) message = "Great effort! You learned a lot!";
    else if (percentage >= 40) message = "Good try! Want to learn more?";
    else message = "Keep exploring! Every quiz makes you smarter!";

    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">{countryFlag}</div>
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
        <p className="text-cyan-400 text-lg mb-6">{countryName}</p>
        <div className="bg-slate-800/50 rounded-2xl p-8 mb-8 border border-slate-700">
          <div className="text-6xl font-bold text-white mb-2">
            {score}/{questions.length}
          </div>
          <p className="text-slate-300 text-lg mb-4">{message}</p>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
            <div
              className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-blue-600"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm">{percentage}% correct</p>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-400 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onBackToCountry}
            className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-full hover:bg-slate-600 transition-colors"
          >
            Back to {countryName}
          </button>
          <button
            onClick={onBackToGlobe}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            Back to Globe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{countryFlag}</span>
          <span className="text-white font-semibold">{countryName} Quiz</span>
        </div>
        <span className="text-slate-400 text-sm">
          {currentQ + 1} of {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-8">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
          style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold text-white mb-6">{question.question}</h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => {
          let bgClass = "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:border-slate-500";
          if (answered) {
            if (i === question.correct) {
              bgClass = "bg-green-900/50 border-green-500";
            } else if (i === selectedAnswer && !isCorrect) {
              bgClass = "bg-red-900/50 border-red-500";
            } else {
              bgClass = "bg-slate-800/30 border-slate-700 opacity-50";
            }
          } else if (selectedAnswer === i) {
            bgClass = "bg-cyan-900/50 border-cyan-500";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full text-left px-5 py-4 rounded-xl border ${bgClass} transition-all text-white font-medium`}
            >
              <span className="text-slate-400 mr-3">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className={`rounded-xl p-5 mb-6 border ${
            isCorrect
              ? "bg-green-900/30 border-green-500/50"
              : "bg-red-900/30 border-red-500/50"
          }`}
        >
          <p className="font-bold text-lg mb-1">
            {isCorrect ? "Correct!" : "Not quite!"}
          </p>
          <p className="text-slate-200">{question.explanation}</p>
        </div>
      )}

      {/* Next button */}
      {answered && (
        <div className="text-center">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg"
          >
            {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}
