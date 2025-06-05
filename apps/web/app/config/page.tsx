"use client";
import { useRouter } from "next/navigation";
import ConfigForm from "@/components/common/ConfigForm";
import { useEffect } from "react";
import { loadDashboardState } from "@/lib/utils";

export default function ConfigPage() {
  const router = useRouter();

  useEffect(() => {
    const state = loadDashboardState();
    if (state && state.configured) {
      router.replace("/dashboard");
    }
  }, [router]);

  return <ConfigForm onConfigured={() => router.replace("/dashboard")} />;
}