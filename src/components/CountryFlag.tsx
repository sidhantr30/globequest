"use client";

/**
 * Renders a country flag as an image (via flagcdn.com) for cross-platform support.
 * Windows browsers don't render emoji flags — they show two-letter codes instead.
 * This component extracts the ISO country code from the flag emoji and uses an image.
 */

function emojiToCountryCode(emoji: string): string {
  const codePoints = [...emoji].map((c) => c.codePointAt(0)!);
  return codePoints
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 65))
    .join("")
    .toLowerCase();
}

interface CountryFlagProps {
  emoji: string;
  size?: number;
  className?: string;
}

export default function CountryFlag({ emoji, size = 64, className = "" }: CountryFlagProps) {
  const code = emojiToCountryCode(emoji);

  if (!code || code.length !== 2) {
    return <span className={className}>{emoji}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w${size <= 40 ? 80 : 160}/${code}.png`}
      srcSet={`https://flagcdn.com/w${size <= 40 ? 160 : 320}/${code}.png 2x`}
      alt={`Flag of ${code.toUpperCase()}`}
      width={size}
      style={{ display: "inline-block", verticalAlign: "middle" }}
      className={className}
    />
  );
}
