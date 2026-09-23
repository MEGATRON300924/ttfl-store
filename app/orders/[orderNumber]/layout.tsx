import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ orderNumber: string }> }): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber}`,
    description: `View order ${orderNumber}, payment status, items, and delivery progress on TTFL Store.`,
    robots: { index: false, follow: false },
  };
}

export default function OrderLayout({ children }: { children: React.ReactNode }) { return children; }
