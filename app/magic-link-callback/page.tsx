"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function MagicLinkCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleMagicLinkCallback = async () => {
      try {
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        if (token_hash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });
          if (error) {
            setStatus("error");
            setMessage(error.message);
          } else if (data.user) {
            setStatus("success");
            setMessage("Successfully signed in with magic link!");
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage("Invalid magic link. Please try again.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "An error occurred during sign in");
      }
    };
    handleMagicLinkCallback();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Magic Link</h1>
      <p>{status === "loading" ? "Processing magic link..." : message}</p>
    </div>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen"><h1 className="text-2xl font-bold mb-4">Magic Link</h1><p>Processing magic link...</p></div>}>
      <MagicLinkCallbackContent />
    </Suspense>
  );
}
