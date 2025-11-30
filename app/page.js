"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("jdc-user");
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      <h1>Kalangus</h1>
      <p>Redirecionando...</p>
    </main>
  );
}
