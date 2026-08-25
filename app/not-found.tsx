import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <SearchX className="h-12 w-12 text-graphite-300" />
      <h1 className="mt-4 text-2xl font-bold text-graphite-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-graphite-600">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
      >
        Back to homepage
      </Link>
    </div>
  );
}
