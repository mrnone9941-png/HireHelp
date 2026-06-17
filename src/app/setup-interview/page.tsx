"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, BriefcaseBusiness, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function SetupInterview() {
  const router = useRouter();
  const [role, setRole] = useState("MERN Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Junior");
  const [interviewType, setInterviewType] = useState("Technical");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/interviews", {
        role,
        experienceLevel,
        interviewType,
        numQuestions
      });
      router.push(`/interview/${res.data.session._id}`);
    } catch (err: unknown) {
      console.error(err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.response?.data?.detail
        : null;
      setError(message || "Failed to create a HireHelp practice session. Ensure the AI service is running.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="mb-8 flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft size={20} /> Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">HireHelp setup</p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">Build a practice session</h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Choose the role, level, and focus area. HireHelp will shape the questions around the conversation you actually need to practice.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <SlidersHorizontal size={24} />
            </div>
          </div>

          {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

          <form onSubmit={handleStart} className="space-y-6">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <BriefcaseBusiness size={16} />
                Target role
              </label>
              <input
                type="text"
                required
                className="field"
                placeholder="e.g. Frontend Developer, Data Scientist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Experience level</label>
                <select
                  className="field appearance-none"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner (0-1 yrs)</option>
                  <option value="Junior">Junior (1-3 yrs)</option>
                  <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                  <option value="Senior">Senior (5+ yrs)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Practice type</label>
                <select
                  className="field appearance-none"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR / Behavioral</option>
                  <option value="Coding">Live coding</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
            </div>

            <div className="soft-panel p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <label className="text-sm font-semibold text-slate-700">Questions</label>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary shadow-sm">{numQuestions}</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                className="w-full accent-primary"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full py-4 text-base"
            >
              {loading ? <><Loader2 className="animate-spin" size={20} /> Preparing session...</> : "Start practice"}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
