export const USER_COLORS = [
  // Slate / Steel
  { bg: "bg-[#1f2937]", border: "border-[#38bdf8]", name: "text-[#38bdf8]" },
  { bg: "bg-[#1e293b]", border: "border-[#60a5fa]", name: "text-[#60a5fa]" },
  { bg: "bg-[#1c2633]", border: "border-[#93c5fd]", name: "text-[#93c5fd]" },

  // Violet / Indigo
  { bg: "bg-[#221c2d]", border: "border-[#a78bfa]", name: "text-[#a78bfa]" },
  { bg: "bg-[#1f1b2e]", border: "border-[#818cf8]", name: "text-[#818cf8]" },
  { bg: "bg-[#1e1b36]", border: "border-[#c4b5fd]", name: "text-[#c4b5fd]" },

  // Emerald / Teal
  { bg: "bg-[#1f2a24]", border: "border-[#34d399]", name: "text-[#34d399]" },
  { bg: "bg-[#1b2f2a]", border: "border-[#2dd4bf]", name: "text-[#2dd4bf]" },
  { bg: "bg-[#1a2b2d]", border: "border-[#5eead4]", name: "text-[#5eead4]" },

  // Rose / Pink (muted)
  { bg: "bg-[#2a1f2d]", border: "border-[#f472b6]", name: "text-[#f472b6]" },
  { bg: "bg-[#2b1f27]", border: "border-[#fb7185]", name: "text-[#fb7185]" },
  { bg: "bg-[#2e1f24]", border: "border-[#fda4af]", name: "text-[#fda4af]" },

  // Amber / Gold (very controlled)
  { bg: "bg-[#2a241f]", border: "border-[#facc15]", name: "text-[#facc15]" },
  { bg: "bg-[#2b261c]", border: "border-[#eab308]", name: "text-[#eab308]" },
  { bg: "bg-[#2f2a1e]", border: "border-[#fde047]", name: "text-[#fde047]" },

  // Cyan / Ice
  { bg: "bg-[#1b2630]", border: "border-[#22d3ee]", name: "text-[#22d3ee]" },
  { bg: "bg-[#182733]", border: "border-[#67e8f9]", name: "text-[#67e8f9]" },

  // Neutral cool tones
  { bg: "bg-[#242424]", border: "border-[#a3a3a3]", name: "text-[#d4d4d4]" },
  { bg: "bg-[#1f1f1f]", border: "border-[#737373]", name: "text-[#a3a3a3]" },

  // Earth / Olive (rare but classy)
  { bg: "bg-[#23281f]", border: "border-[#84cc16]", name: "text-[#84cc16]" },
  { bg: "bg-[#26291d]", border: "border-[#a3e635]", name: "text-[#a3e635]" },

  // Deep red (controlled, not error-looking)
  { bg: "bg-[#2a1f1f]", border: "border-[#f87171]", name: "text-[#f87171]" },
  { bg: "bg-[#2d1c1c]", border: "border-[#ef4444]", name: "text-[#ef4444]" },

  // Final cool accent
  { bg: "bg-[#1c2a33]", border: "border-[#7dd3fc]", name: "text-[#7dd3fc]" },
];



function hashUserId(userId: string) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash << 5) - hash + userId.charCodeAt(i);
    }
    return Math.abs(hash);
}

export function getColorForUser(userId: string) {
    const index = hashUserId(userId) % USER_COLORS.length;
    return USER_COLORS[index];
}

