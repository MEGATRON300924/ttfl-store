import { Suspense } from "react";
import { OrderConfirmView } from "./confirm-view";

export default function OrderConfirmPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmView />
    </Suspense>
  );
}
