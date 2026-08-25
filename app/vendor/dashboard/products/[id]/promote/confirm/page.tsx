import { Suspense } from "react";
import { PromoteProductConfirmView } from "./confirm-view";

export default function PromoteProductConfirmPage() {
  return (
    <Suspense fallback={null}>
      <PromoteProductConfirmView />
    </Suspense>
  );
}
