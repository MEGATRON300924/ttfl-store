import { Suspense } from "react";
import { SubscriptionConfirmView } from "./confirm-view";

export default function SubscriptionConfirmPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionConfirmView />
    </Suspense>
  );
}
