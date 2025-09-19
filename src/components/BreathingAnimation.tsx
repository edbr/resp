"use client";

import React, { useEffect, useState } from "react";

type Phase = "inhale" | "hold" | "exhale" | "hold2";

export function BreathingAnimation() {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [scale, setScale] = useState(1);

  // Customize cycle times (ms)
  const inhaleTime = 4000;
  const holdTime = 2000;
  const exhaleTime = 4000;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (phase === "inhale") {
      setScale(1.5);
      timeout = setTimeout(() => setPhase("hold"), inhaleTime);
    } else if (phase === "hold") {
      timeout = setTimeout(() => setPhase("exhale"), holdTime);
    } else if (phase === "exhale") {
      setScale(1);
      timeout = setTimeout(() => setPhase("hold2"), exhaleTime);
    } else if (phase === "hold2") {
      timeout = setTimeout(() => setPhase("inhale"), holdTime);
    }
    return () => clearTimeout(timeout);
  }, [phase]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-100 text-center">
      <div
        className="w-48 h-48 rounded-full bg-primary transition-transform duration-[4000ms] ease-in-out"
        style={{ transform: `scale(${scale})` }}
      />
      <p className="mt-6 text-xl font-medium capitalize text-foreground">
        {phase}
      </p>
    </div>
  );
}
