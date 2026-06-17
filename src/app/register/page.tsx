"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/utils/axios";
import axios from "axios";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import Link from "next/link";
import { motion } from "framer-motion";

const getAuthErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message || fallback;
  }

  return fallback;
};

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data, res.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Registration failed"));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const res = await api.post("/auth/google", { tokenId: credentialResponse.credential });
      login(res.data, res.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Google login failed"));
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-3 font-bold">
        <span className="brand-mark">HH</span>
        <span className="text-xl">HireHelp</span>
      </Link>

      <div className="flex min-h-[calc(100vh-128px)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Start gently</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Create your HireHelp account</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Save sessions, track progress, and turn practice into a repeatable routine.
            </p>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
              <input
                type="text"
                required
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                required
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="primary-button w-full">
              Create account
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 text-sm font-semibold text-muted-foreground">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google login failed")}
              theme="outline"
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already using HireHelp? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
