"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
        <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
      </div>
    </div>
  );
}
