"use client";

import { useState } from "react";
import { useClub } from "@/context/club-context";

const CATEGORIES = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª"];

const MOCK_RANKING = [
  { pos: 1, name: "Martín Díaz", initials: "MD", pts: 2008, delta: 1, dir: "up" },
  { pos: 2, name: "Tomás Sosa", initials: "TS", pts: 1963, delta: 0, dir: "eq" },
  { pos: 3, name: "Federico Luna", initials: "FL", pts: 1918, delta: 1, dir: "down" },
  { pos: 4, name: "Santiago Ríos", initials: "SR", pts: 1873, delta: 1, dir: "up" },
  { pos: 5, name: "Bruno Salas", initials: "BS", pts: 1828, delta: 0, dir: "eq" },
  { pos: 6, name: "Gonzalo Ferro", initials: "GF", pts: 1783, delta: 2, dir: "down" },
  { pos: 7, name: "Vos", initials: "V", pts: 1738, delta: 0, dir: "eq", isYou: true },
  { pos: 8, name: "Lucas Romero", initials: "LR", pts: 1693, delta: 0, dir: "eq" },
  { pos: 9, name: "Joaquín Pérez", initials: "JP", pts: 1650, delta: 1, dir: "up" },
  { pos: 10, name: "Andrés Gil", initials: "AG", pts: 1612, delta: 0, dir: "eq" },
];

export function ClubRankingStandalone() {
  const { config } = useClub();
  const [selectedCat, setSelectedCat] = useState("4ª");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#F2F3F5]">Ranking</h2>
        <p className="text-sm text-[#6B7280]">{config.clubName} · Temporada 2026</p>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              selectedCat === cat
                ? "bg-[#D6FF3D] text-[#0A0B0D]"
                : "border border-[#1E2028] bg-[#14161A] text-[#9CA3AF] hover:border-[#2a3036]"
            }`}
          >
            Cat. {cat}
          </button>
        ))}
      </div>

      {/* Ranking list */}
      <div className="space-y-2">
        {MOCK_RANKING.map((r) => (
          <div
            key={r.pos}
            className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 ${
              r.isYou
                ? "border border-[#D6FF3D]/35 bg-[#D6FF3D]/8"
                : "border border-[#1E2028] bg-[#14161A]"
            }`}
          >
            {/* Position */}
            <span className={`w-6 text-center text-base font-bold ${r.isYou ? "text-[#D6FF3D]" : "text-[#6B7280]"}`}>
              {r.pos}
            </span>

            {/* Avatar */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                r.isYou
                  ? "bg-[#2a3416] text-[#D6FF3D]"
                  : "bg-[#1a1d24] text-[#9CA3AF]"
              }`}
            >
              {r.initials}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#F2F3F5]">
                {r.name}
                {r.isYou && <span className="ml-1.5 text-[11px] text-[#D6FF3D]">· vos</span>}
              </span>
            </div>

            {/* Delta */}
            <span className={`text-xs font-medium ${
              r.dir === "up" ? "text-[#D6FF3D]" : r.dir === "down" ? "text-red-400" : "text-[#4B5563]"
            }`}>
              {r.dir === "up" ? `▲${r.delta}` : r.dir === "down" ? `▼${r.delta}` : "="}
            </span>

            {/* Points */}
            <span className="text-sm font-bold text-[#F2F3F5] w-12 text-right">{r.pts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
