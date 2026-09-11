import { Suspense } from "react";
import AdPaymentConfirmation from "./ad-payment-confirmation";

function LoadingConfirmation() {
  return (
    <div className="shell py-20">
      <div className="mx-auto max-w-lg rounded-card border border-graphite-200 bg-white p-8 text-center dark:border-graphite-700 dark:bg-graphite-900">
        <p className="text-sm text-graphite-500">Checking payment…</p>
      </div>
    </div>
  );
}

export default function AdPaymentConfirmationPage() {
  return (
    <Suspense fallback={<LoadingConfirmation />}>
      <AdPaymentConfirmation />
    </Suspense>
  );
}
