"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { Navbar } from "./Navbar";
import Login from "./Login";
import type { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AppHeader() {
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          console.error("Session validation failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
    };

    validateSession();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-base-content/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            {pathname !== "/" && (
              <button
                onClick={() => router.back()}
                className="btn btn-ghost btn-sm btn-circle hover-scale mr-2 text-base-content/60 hover:text-primary-500 transition-colors"
                title="Go Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Navbar />
          </div>
          <div className="flex items-center gap-4">
            <Login user={user} setUser={setUser} />
          </div>
        </div>
      </div>
    </header>
  );
}
