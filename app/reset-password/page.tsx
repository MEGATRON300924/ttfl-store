import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="shell flex min-h-[70vh] items-center justify-center py-12"><div className="text-sm text-graphite-500 dark:text-graphite-400">Loading…</div></main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
