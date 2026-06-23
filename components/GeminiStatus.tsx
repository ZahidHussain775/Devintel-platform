"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Status = "checking" | "connected" | "error";

// Shows a small badge in the header — green when Groq is connected,
// red when the API key is missing or invalid.
export function GeminiStatus() {
  const [status, setStatus]   = useState<Status>("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Calls /api/groq-test on mount to verify the Groq key works
    async function checkConnection() {
      try {
        const res  = await fetch("/api/groq-test");
        const data = await res.json();
        if (data.status === "connected") {
          setStatus("connected");
          setMessage(data.response);
        } else {
          setStatus("error");
          setMessage(data.message ?? "Connection failed");
        }
      } catch {
        setStatus("error");
        setMessage("Could not reach AI API");
      }
    }
    checkConnection();
  }, []);

  if (status === "checking") {
    return (
      <span className="flex items-center gap-1.5 text-xs"
        style={{ color: "var(--color-text-faint)" }}>
        <Loader2 size={12} className="animate-spin" />
        Connecting to AI…
      </span>
    );
  }

  if (status === "connected") {
    return (
      <span className="flex items-center gap-1.5 text-xs"
        style={{ color: "var(--color-accent)" }}
        title={message}>
        <CheckCircle2 size={12} />
        AI connected
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs"
      style={{ color: "#f87171" }}
      title={message}>
      <XCircle size={12} />
      AI not connected
    </span>
  );
}
