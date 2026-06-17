"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

const practiceSteps = [
  {
    title: "Warm up",
    text: "Tell HireHelp the role, level, and interview style you are preparing for.",
    icon: Sparkles,
  },
  {
    title: "Practice",
    text: "Answer realistic prompts with voice, text, or code in a calm practice room.",
    icon: MessageCircle,
  },
  {
    title: "Review",
    text: "See feedback that explains what landed well and what to improve next.",
    icon: BarChart3,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-white text-foreground">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <span className="brand-mark">HH</span>
          <span className="text-xl">HireHelp</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="secondary-button px-4 py-2">
            Sign in
          </Link>
          <Link href="/register" className="primary-button px-4 py-2">
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl items-center gap-12 px-6 pb-12 pt-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground">
            <Users size={16} />
            Built for calmer, more useful interview practice
          </div>
          <h1 className="text-5xl font-black leading-[1.02] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
            HireHelp
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
            Practice for the job you want with a supportive coach that asks relevant questions, listens to your answers, and turns every session into clear next steps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="primary-button">
              Start practicing
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="secondary-button">
              Continue session
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {practiceSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-lg border border-border bg-white p-4 shadow-sm">
                  <Icon className="mb-3 text-primary" size={22} />
                  <h2 className="font-bold text-slate-950">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="glass-card"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Today in HireHelp</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Frontend Developer practice</h2>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
              82% ready
            </span>
          </div>

          <div className="space-y-4">
            <div className="soft-panel p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
                  HC
                </span>
                <div>
                  <p className="font-bold text-slate-950">HireHelp Coach</p>
                  <p className="text-sm text-muted-foreground">Warm, direct, and focused on growth</p>
                </div>
              </div>
              <p className="text-base leading-7 text-slate-700">
                Let us strengthen your system design answer first, then do one behavioral question so your story feels crisp.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-sm font-semibold text-muted-foreground">Current focus</p>
                <p className="mt-2 text-2xl font-black text-slate-950">React state</p>
              </div>
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-sm font-semibold text-muted-foreground">Next review</p>
                <p className="mt-2 text-2xl font-black text-slate-950">3 tips</p>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 size={18} />
                Confidence builder
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                You are explaining tradeoffs clearly. Add one concrete example and your answer will feel much more grounded.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
