"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import type { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface LoginProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Login({ user, setUser }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      const { token, user: userData } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setShowForm(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowForm(false);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-base-content hidden sm:inline">
            {user.name}
          </span>
        </div>
        <button
          onClick={() => window.location.href = "/history"}
          className="btn btn-sm glass text-base-content hover-scale transition-all duration-300 border-base-content/20 gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">History</span>
        </button>
        <button
          onClick={handleLogout}
          className="btn btn-sm glass text-base-content hover-scale transition-all duration-300 border-base-content/20"
        >
          Logout
        </button>
      </div>
    );
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="glass-strong bg-base-100/80 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-slide-up relative border border-base-content/10">
        {/* Close button */}
        <button
          onClick={() => {
            setShowForm(false);
            setError("");
          }}
          className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-poppins font-bold text-3xl gradient-text mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-base-content/60 text-sm">
            {isRegister
              ? "Join EduTube for a distraction-free experience"
              : "Sign in to your EduTube account"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error shadow-lg mb-6 text-sm rounded-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="label">
                <span className="label-text font-medium text-base-content/80">
                  Name
                </span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input input-bordered w-full bg-base-200 border-2 border-transparent focus:border-primary-500 focus:shadow-glow transition-all duration-300 rounded-xl"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="label">
              <span className="label-text font-medium text-base-content/80">
                Email
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input input-bordered w-full bg-base-200 border-2 border-transparent focus:border-primary-500 focus:shadow-glow transition-all duration-300 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium text-base-content/80">
                Password
              </span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input input-bordered w-full bg-base-200 border-2 border-transparent focus:border-primary-500 focus:shadow-glow transition-all duration-300 rounded-xl"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn gradient-primary text-white w-full font-semibold border-0 hover-scale hover-glow shadow-md transition-all duration-300 rounded-xl mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                {isRegister ? "Creating account..." : "Signing in..."}
              </span>
            ) : isRegister ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <p className="text-sm text-base-content/60">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="font-semibold gradient-text hover:underline"
            >
              {isRegister ? "Sign In" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="btn gradient-primary text-white font-semibold px-6 border-0 hover-scale hover-glow shadow-md transition-all duration-300"
      >
        Sign In
      </button>
      {showForm && mounted && document.body && 
        createPortal(modalContent, document.body)}
    </>
  );
}
