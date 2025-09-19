"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Phase = "inhale" | "hold" | "exhale" | "hold2";
type Status = "idle" | "running" | "paused" | "finished";

export function BreathingSession() {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState<Status>("idle");

  // Cycle times (ms) – adjustable
  const [inhaleTime, setInhaleTime] = useState(4000);
  const [holdTime, setHoldTime] = useState(2000);
  const [exhaleTime, setExhaleTime] = useState(4000);

  // Session length in minutes
  const [sessionMinutes, setSessionMinutes] = useState(5);
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle breathing phases
  useEffect(() => {
    if (status !== "running") return;

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
  }, [phase, status, inhaleTime, exhaleTime, holdTime]);

  // Track elapsed time + stop session
  useEffect(() => {
    if (status !== "running") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1000;
        if (next >= sessionMinutes * 60 * 1000) {
          setStatus("finished");
          saveStats(sessionMinutes);
          clearInterval(timerRef.current!);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, sessionMinutes]);

  // Save stats to localStorage
  function saveStats(duration: number) {
    const key = "breathing-stats";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    const newEntry = {
      date: new Date().toISOString(),
      duration,
    };
    localStorage.setItem(key, JSON.stringify([...prev, newEntry]));
  }

  // Controls
  function startSession() {
    setElapsed(0);
    setPhase("inhale");
    setStatus("running");
  }
  function pauseSession() {
    setStatus("paused");
  }
  function resetSession() {
    setElapsed(0);
    setPhase("inhale");
    setStatus("idle");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-100 text-center p-4">
      {/* Breathing circle */}
      <div
        className={`w-48 h-48 rounded-full bg-primary transition-transform ease-in-out`}
        style={{
          transform: `scale(${scale})`,
          transitionDuration: `${phase === "inhale" || phase === "exhale" ? 4000 : 0}ms`,
        }}
      />
      <p className="mt-6 text-xl font-medium capitalize text-foreground">
        {status === "finished" ? "Session Complete" : phase}
      </p>

      {/* Timer */}
      <p className="mt-2 text-sm text-muted-foreground">
        {Math.floor(elapsed / 60000)}:{String(Math.floor((elapsed % 60000) / 1000)).padStart(2, "0")} /{" "}
        {sessionMinutes}:00
      </p>

      {/* Controls */}
      <div className="flex gap-2 mt-6">
        {status === "idle" && (
          <Button onClick={startSession} variant="default">
            Start
          </Button>
        )}
        {status === "running" && (
          <Button onClick={pauseSession} variant="secondary">
            Pause
          </Button>
        )}
        {status === "paused" && (
          <Button onClick={startSession} variant="default">
            Resume
          </Button>
        )}
        <Button onClick={resetSession} variant="destructive">
          Reset
        </Button>
      </div>

      {/* Settings */}
      <div className="mt-8 space-y-4 w-full max-w-md">
        <h2 className="text-lg font-semibold">Settings</h2>

        <label className="block text-sm">Session length: {sessionMinutes} min</label>
        <Slider
          defaultValue={[sessionMinutes]}
          max={30}
          min={1}
          step={1}
          onValueChange={(v) => setSessionMinutes(v[0])}
        />

        <label className="block text-sm">Inhale: {(inhaleTime / 1000).toFixed(0)}s</label>
        <Slider
          defaultValue={[inhaleTime / 1000]}
          max={10}
          min={2}
          step={1}
          onValueChange={(v) => setInhaleTime(v[0] * 1000)}
        />

        <label className="block text-sm">Hold: {(holdTime / 1000).toFixed(0)}s</label>
        <Slider
          defaultValue={[holdTime / 1000]}
          max={10}
          min={0}
          step={1}
          onValueChange={(v) => setHoldTime(v[0] * 1000)}
        />

        <label className="block text-sm">Exhale: {(exhaleTime / 1000).toFixed(0)}s</label>
        <Slider
          defaultValue={[exhaleTime / 1000]}
          max={10}
          min={2}
          step={1}
          onValueChange={(v) => setExhaleTime(v[0] * 1000)}
        />
      </div>
    </div>
  );
}
