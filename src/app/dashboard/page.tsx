"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Clock, LogOut, Plus, Sparkles } from "lucide-react";

type PracticeSession = {
  _id: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  overallScore?: number;
  status?: string;
  createdAt: string;
};

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [history, setHistory] = useState<PracticeSession[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get("/interviews");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  const averageScore = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / history.length)
    : 0;

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="brand-mark">HH</span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">HireHelp workspace</p>
              <h1 className="text-3xl font-black text-slate-950">Welcome, {user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <div
                aria-label={`${user.name} avatar`}
                className="h-11 w-11 rounded-full border border-border bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${user.avatar})` }}
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-lg font-black text-secondary-foreground">
                {user.name.charAt(0)}
              </div>
            )}
            <button onClick={handleLogout} className="secondary-button px-4 py-2">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <section className="mb-10 grid gap-6 md:grid-cols-3">
          <Link href="/setup-interview">
            <motion.div
              whileHover={{ y: -3 }}
              className="glass-card flex h-48 cursor-pointer flex-col justify-between border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <Plus size={26} />
                </div>
                <ArrowRight className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950">New practice session</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Generate focused questions for the role you are targeting.
                </p>
              </div>
            </motion.div>
          </Link>

          <div className="glass-card flex h-48 flex-col justify-between">
            <Clock className="text-primary" size={28} />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total sessions</h2>
              <p className="mt-2 text-5xl font-black text-slate-950">{history.length}</p>
            </div>
          </div>

          <div className="glass-card flex h-48 flex-col justify-between">
            <BarChart3 className="text-emerald-600" size={28} />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Average score</h2>
              <p className="mt-2 text-5xl font-black text-slate-950">{averageScore}%</p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 shrink-0 text-amber-700" size={20} />
            <div>
              <h2 className="font-bold text-amber-950">A more human practice rhythm</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Try one focused session, review the feedback, then repeat the weakest area. Short, steady practice beats cramming.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Progress</p>
            <h2 className="text-2xl font-black text-slate-950">Recent practice</h2>
          </div>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-bold text-slate-950">No practice sessions yet</h3>
              <p className="mt-2 text-muted-foreground">Start with one role and HireHelp will build the first round for you.</p>
            </div>
          ) : (
            history.map((session) => (
              <Link key={session._id} href={`/analytics/${session._id}`}>
                <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-primary">{session.role}</h3>
                      <p className="text-sm text-muted-foreground">{session.experienceLevel} | {session.interviewType}</p>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">{new Date(session.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-2xl font-black text-slate-950">{session.overallScore ? `${Math.round(session.overallScore)}%` : "N/A"}</p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${session.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
