import { Suspense } from "react";
import { PromoteStoreConfirmView } from "./confirm-view";

export default function PromoteStoreConfirmPage() {
  return (
    <Suspense fallback={null}>
      <PromoteStoreConfirmView />
    </Suspense>
  );
}
