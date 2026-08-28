```tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token was provided.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`,
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
            data?.message || "This verification link is invalid or has expired."
          );
        }

        setStatus("success");
        setMessage("Your email has been successfully verified! 🎉");
      } catch (error) {
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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        {status === "loading" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
            <h1>Verifying your email...</h1>
            <p>Please wait while we confirm your email address.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>✅</div>
            <h1>Email verified!</h1>
            <p>{message}</p>

            <button
              onClick={() => router.push("/login")}
              style={{
                marginTop: "24px",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Continue to login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>❌</div>
            <h1>Verification failed</h1>
            <p>{message}</p>

            <button
              onClick={() => router.push("/login")}
              style={{
                marginTop: "24px",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </main>
  );
}
```
