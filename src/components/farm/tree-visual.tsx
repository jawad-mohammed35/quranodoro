"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GROWTH_STAGES } from "@/data/trees";

function Frond({
  angle,
  length,
  fill,
}: {
  angle: number;
  length: number;
  fill: string;
}) {
  return (
    <g transform={`rotate(${angle}) scale(${length})`}>
      <path
        d="M0 0 Q16 -16 45 -7"
        fill="none"
        stroke="#779675"
        strokeWidth="2"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 4 + i * 6;
        const y = -3 - Math.sin(i * 0.55) * 7;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d="M0 0 Q1 -7 9 -9 Q6 -2 0 0" fill="#a9c69a" />
            <path d="M0 0 Q8 -1 12 9 Q4 7 0 0" fill={fill} />
          </g>
        );
      })}
    </g>
  );
}

export function TreeVisual({
  stageIndex,
  growing = false,
  size = "sm",
}: {
  stageIndex: number;
  growing?: boolean;
  size?: "sm" | "lg";
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const stage =
    GROWTH_STAGES[Math.max(0, Math.min(stageIndex, GROWTH_STAGES.length - 1))];
  const n = stage.index;
  const crown = 102 - n * 10;
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <svg
      viewBox="0 0 160 142"
      role="img"
      aria-label={stage.name + " stage"}
      className={
        size === "lg" ? "mx-auto h-40 max-w-full" : "mx-auto h-24 max-w-full"
      }
    >
      <defs>
        <linearGradient id={id + "-soil"} x2=".4" y2="1">
          <stop stopColor="#ede2bd" />
          <stop offset="1" stopColor="#bc9d78" />
        </linearGradient>
        <linearGradient id={id + "-bark"}>
          <stop stopColor="#d9b785" />
          <stop offset=".45" stopColor="#b79069" />
          <stop offset="1" stopColor="#826549" />
        </linearGradient>
        <linearGradient id={id + "-leaf"} x2=".6" y2="1">
          <stop stopColor="#a4c8a0" />
          <stop offset="1" stopColor="#557e66" />
        </linearGradient>
        <radialGradient id={id + "-date"} cx=".32" cy=".25" r=".8">
          <stop stopColor="#ecc491" />
          <stop offset=".55" stopColor="#bb805c" />
          <stop offset="1" stopColor="#855645" />
        </radialGradient>
      </defs>
      <ellipse cx="84" cy="128" rx="48" ry="7" fill="#6b715c" opacity=".13" />
      <path
        d="M32 118 Q36 103 77 103 Q117 102 128 117 Q130 130 80 132 Q40 131 32 118"
        fill={paint("soil")}
      />
      <ellipse cx="80" cy="115" rx="46" ry="11" fill="#e4d5b3" />
      <ellipse
        cx="84"
        cy="117"
        rx={12 + n * 2}
        ry="4"
        fill="#87765e"
        opacity=".25"
      />
      <motion.g
        key={n}
        initial={reduced ? false : { opacity: 0, scale: 0.88 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotate: growing && !reduced ? [0, 1, 0] : 0,
        }}
        transition={{
          duration: 0.35,
          rotate: { duration: 4, repeat: Infinity },
        }}
        style={{ transformOrigin: "80px 116px" }}
      >
        {n < 2 && (
          <g transform="rotate(-20 80 112)">
            <ellipse cx="80" cy="111" rx="14" ry="8" fill={paint("date")} />
            <path
              d="M70 111 Q79 106 90 111"
              fill="none"
              stroke="#996748"
              strokeWidth="2"
            />
          </g>
        )}
        {n > 0 && (
          <>
            <path
              d={`M${78 - n} 116 Q80 93 78 ${crown} L83 ${crown} Q82 95 ${81 + n} 116 Z`}
              fill={paint("bark")}
            />
            {n < 3 ? (
              <g transform={`translate(80 ${crown}) scale(${0.7 + n * 0.18})`}>
                <path
                  d="M0 1 Q-17 4 -23 -16 Q-6 -18 0 1"
                  fill={paint("leaf")}
                />
                <path d="M0 1 Q3 -20 24 -21 Q20 -3 0 1" fill={paint("leaf")} />
                {n === 2 && (
                  <path d="M0 -2 Q-8 -17 -4 -30 Q6 -21 0 -2" fill="#92b798" />
                )}
              </g>
            ) : (
              <g transform={`translate(80 ${crown}) scale(${0.53 + n * 0.1})`}>
                {[1, -1].map((side) => (
                  <g key={side} transform={`scale(${side} 1)`}>
                    <Frond angle={-38} length={0.77} fill={paint("leaf")} />
                    <Frond angle={4} length={1} fill={paint("leaf")} />
                    <Frond angle={40} length={0.83} fill={paint("leaf")} />
                    {n >= 5 &&
                      [0, 1, 2, 3, 4].map((i) => (
                        <ellipse
                          key={i}
                          cx={7 + (i % 3) * 3}
                          cy={9 + Math.floor(i / 3) * 5}
                          rx="2.8"
                          ry="4"
                          fill={paint("date")}
                        />
                      ))}
                  </g>
                ))}
              </g>
            )}
          </>
        )}
        {n === 6 && (
          <path
            d="m126 65 2 -7 2 7 6 2 -6 2 -2 7 -2 -7 -6 -2z"
            fill="#dec485"
          />
        )}
      </motion.g>
    </svg>
  );
}
