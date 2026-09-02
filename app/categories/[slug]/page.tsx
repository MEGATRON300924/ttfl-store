import { redirect } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  redirect(
    `/shop?category=${encodeURIComponent(
      params.slug
    )}`
  );
}
