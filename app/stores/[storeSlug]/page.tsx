import { redirect } from "next/navigation";

export default function LegacyStorePage({ params }: { params: { storeSlug: string } }) {
  redirect(`/store/${encodeURIComponent(params.storeSlug)}`);
}
