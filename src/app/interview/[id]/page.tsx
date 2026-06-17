"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/utils/axios";
import { socket } from "@/utils/socket";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { CheckCircle, Code, Loader2, Mic, MicOff, Send, UserRound } from "lucide-react";

type PracticeQuestion = {
  _id: string;
  questionText: string;
  questionType: string;
};

type PracticeSession = {
  role: string;
  questions: PracticeQuestion[];
};

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [textAnswer, setTextAnswer] = useState("");
  const [codeAnswer, setCodeAnswer] = useState("// Write your code here\n");
  const [language, setLanguage] = useState("javascript");

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [submitting, setSubmitting] = useState(false);

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

    socket.connect();
    socket.emit("join_interview", sessionId);

    socket.on("evaluation_complete", (data: { questionId: string }) => {
      console.log("Evaluation complete for question", data.questionId);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, isAuthenticated, router]);

  const currentQuestion = session?.questions?.[currentQuestionIndex];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing mic", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (audioBlob) {
        formData.append("audioFile", audioBlob, "answer.webm");
      }
      formData.append("userAnswerText", textAnswer);
      if (currentQuestion.questionType === "Coding" || currentQuestion.questionType === "Mixed") {
        formData.append("userSubmittedCode", codeAnswer);
      }

      await api.post(`/interviews/${sessionId}/questions/${currentQuestion._id}/answer`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAudioBlob(null);
      setTextAnswer("");
      setCodeAnswer("// Write your code here\n");

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await api.post(`/interviews/${sessionId}/complete`);
        router.push(`/analytics/${sessionId}`);
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) return <div className="flex min-h-screen items-center justify-center bg-white text-muted-foreground">Loading practice session...</div>;

  const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <main className="min-h-screen bg-white px-4 py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="glass rounded-lg p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">HireHelp live practice</p>
              <h1 className="text-2xl font-black text-slate-950">{session.role} practice</h1>
              <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {session.questions.length}</p>
            </div>
            <div className="min-w-0 flex-1 lg:max-w-md">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <button
              onClick={async () => {
                await api.post(`/interviews/${sessionId}/complete`);
                router.push(`/analytics/${sessionId}`);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              End practice
            </button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.38fr_0.62fr]">
          <div className="glass-card flex flex-col gap-5">
            <div className="soft-panel flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound size={36} />
              </div>
              <h2 className="text-xl font-black text-slate-950">HireHelp Coach</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Take a breath, answer naturally, and add details as they come.
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border border-border bg-white p-5 shadow-sm"
              >
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Prompt</p>
                <p className="text-lg font-semibold leading-8 text-slate-800">
                  {currentQuestion?.questionText}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="glass-card flex flex-col gap-5">
            {(currentQuestion?.questionType === "Coding" || currentQuestion?.questionType === "Mixed" || currentQuestion?.questionType === "Technical") && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 font-black text-slate-950"><Code size={18} /> Code editor</h2>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div className="h-[360px] overflow-hidden rounded-lg border border-border">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-light"
                    value={codeAnswer}
                    onChange={(value) => setCodeAnswer(value || "")}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <textarea
                className="field h-28 resize-none"
                placeholder="Type your explanation, tradeoffs, or follow-up thoughts here..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition ${
                      isRecording
                        ? "bg-red-600 text-white shadow-sm hover:bg-red-700"
                        : "border border-border bg-white text-foreground hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    {isRecording ? "Stop recording" : "Record answer"}
                  </button>
                  {audioBlob && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700"><CheckCircle size={16} /> Audio ready</span>}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (textAnswer === "" && !audioBlob && codeAnswer.trim() === "// Write your code here")}
                  className="primary-button"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  Submit answer
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
