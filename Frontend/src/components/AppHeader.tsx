"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Navbar } from "./Navbar";
import Login from "./Login";
import type { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function AppHeader() {
  const [user, setUser] = useState<User | null>(null);

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
          <Navbar />
          <div className="flex items-center gap-4">
            <Login user={user} setUser={setUser} />
          </div>
        </div>
      </div>
    </header>
  );
}
