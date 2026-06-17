"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/utils/axios";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

type ReportQuestion = {
  _id: string;
  questionText: string;
  score?: number;
  technicalScore?: number;
  confidenceScore?: number;
  userAnswerText?: string;
  userSubmittedCode?: string;
  idealAnswer?: string;
  aiFeedback?: string;
};

type ReportSession = {
  role: string;
  experienceLevel: string;
  interviewType: string;
  overallScore?: number;
  averageTechnicalScore?: number;
  averageConfidenceScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  questions: ReportQuestion[];
};

export default function Analytics({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [session, setSession] = useState<ReportSession | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await api.get(`/interviews/${sessionId}`);
        setSession(res.data);
      } catch (err) {
        console.error("Failed to load session", err);
      }
    };
    fetchSession();
  }, [sessionId, isAuthenticated, router]);

  if (!session) return <div className="flex min-h-screen items-center justify-center bg-white text-muted-foreground">Loading HireHelp report...</div>;

  const scoreData = [
    { subject: "Overall", A: session.overallScore || 0, fullMark: 100 },
    { subject: "Technical", A: session.averageTechnicalScore || 0, fullMark: 100 },
    { subject: "Confidence", A: session.averageConfidenceScore || 0, fullMark: 100 },
  ];

  const questionProgressData = session.questions.map((q, i) => ({
    name: `Q${i + 1}`,
    score: q.score || 0,
    technical: q.technicalScore || 0,
    confidence: q.confidenceScore || 0,
  }));

  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/dashboard" className="mb-8 flex w-fit items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft size={20} /> Back to dashboard
        </Link>

        <header className="mb-10 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">HireHelp report</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">Practice feedback</h1>
            <p className="mt-3 text-xl text-muted-foreground">{session.role} | {session.experienceLevel} | {session.interviewType}</p>
          </div>
          <div className="rounded-lg border border-border bg-slate-50 p-5 lg:text-right">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overall score</p>
            <p className="mt-2 text-6xl font-black text-primary">{Math.round(session.overallScore || 0)}%</p>
          </div>
        </header>

        <section className="mb-8 grid gap-8 md:grid-cols-2">
          <div className="glass-card h-80">
            <h2 className="mb-4 text-lg font-black text-slate-950">Performance breakdown</h2>
            <ResponsiveContainer width="100%" height="88%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scoreData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.24} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card h-80">
            <h2 className="mb-4 text-lg font-black text-slate-950">Question-by-question progress</h2>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={questionProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <RechartsTooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="technical" stroke="#0f766e" strokeWidth={2} />
                <Line type="monotone" dataKey="confidence" stroke="#d97706" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mb-12 grid gap-8 md:grid-cols-2">
          <div className="glass-card border-t-4 border-t-emerald-500">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950"><CheckCircle2 className="text-emerald-600" /> Strengths</h2>
            <ul className="space-y-3">
              {session.strengths?.map((strength: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-700">{strength}</span>
                </li>
              )) || <p className="text-muted-foreground">Not enough data yet.</p>}
            </ul>
          </div>
          <div className="glass-card border-t-4 border-t-amber-500">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950"><AlertTriangle className="text-amber-600" /> Focus areas</h2>
            <ul className="space-y-3">
              {session.weaknesses?.map((weakness: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-700">{weakness}</span>
                </li>
              )) || <p className="text-muted-foreground">Not enough data yet.</p>}
            </ul>
          </div>
        </section>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Review</p>
          <h2 className="text-2xl font-black text-slate-950">Detailed feedback</h2>
        </div>

        <div className="space-y-6">
          {session.questions.map((q, i) => (
            <div key={q._id} className="glass-card">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-lg font-black leading-7 text-slate-950">Q{i + 1}: {q.questionText}</h3>
                <div className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                  Score: {q.score}%
                </div>
              </div>

              <div className="mb-4 grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Your answer</p>
                  <p className="text-sm italic leading-6 text-slate-700">{q.userAnswerText || "No text answer provided."}</p>
                  {q.userSubmittedCode && q.userSubmittedCode !== "// Write your code here\n" && (
                    <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-sky-100">
                      {q.userSubmittedCode}
                    </pre>
                  )}
                </div>
                <div className="rounded-lg border border-primary/20 bg-white p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">Ideal answer summary</p>
                  <p className="text-sm leading-6 text-slate-700">{q.idealAnswer}</p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-1 shrink-0 text-amber-600" />
                  <div>
                    <p className="mb-1 text-sm font-bold text-amber-950">HireHelp feedback</p>
                    <p className="text-sm leading-6 text-amber-900">{q.aiFeedback || "Pending evaluation..."}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
