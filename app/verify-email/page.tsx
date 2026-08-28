"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token was provided.");
      return;
    }

    async function verifyEmail() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(
          `${apiUrl}/auth/verify-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "This verification link is invalid or has expired."
          );
        }

        setStatus("success");
        setMessage("Your email has been successfully verified!");
      } catch (error) {
        console.error("Email verification error:", error);

        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying your email."
        );
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">

        {status === "loading" && (
          <>
            <div className="text-6xl mb-6">⏳</div>

            <h1 className="text-3xl font-bold mb-3">
              Verifying your email
            </h1>

            <p className="text-gray-500">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-6">✅</div>

            <h1 className="text-3xl font-bold mb-3">
              Email verified!
            </h1>

            <p className="text-gray-500 mb-8">
              {message}
            </p>

            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              Continue to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">❌</div>

            <h1 className="text-3xl font-bold mb-3">
              Verification failed
            </h1>

            <p className="text-gray-500 mb-8">
              {message}
            </p>

            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              Back to Login
            </button>
          </>
        )}

      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">⏳</div>

            <h1 className="text-2xl font-bold">
              Loading...
            </h1>
          </div>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
