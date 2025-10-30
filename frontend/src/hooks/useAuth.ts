"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(role: "admin" | "student") {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || user.role !== role) {
      router.replace("/login"); // redirect if not authenticated
    } else {
      setLoading(false);
    }
  }, [router, role]);

  return loading;
}
