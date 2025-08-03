"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";


function ConfirmSignupContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const supabase = createSupabaseClient();
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });
          if (error) {
            setStatus("error");
            setMessage(error.message);
          } else {
            setStatus("success");
            setMessage("Your email has been confirmed successfully!");
            setTimeout(() => {
              router.push("/login?confirmed=1");
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage("Invalid confirmation link.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "An error occurred during confirmation");
      }
    };
    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Confirming Signup</h1>
      <p>{status === "loading" ? "Processing confirmation..." : message}</p>
    </div>
  );
}

export default function ConfirmSignupPage() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen"><h1 className="text-2xl font-bold mb-4">Confirming Signup</h1><p>Processing confirmation...</p></div>}>
      <ConfirmSignupContent />
    </Suspense>
  );
}
