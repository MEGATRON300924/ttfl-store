export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  previousPrice?: number;
  image: string;
  vendor: string;
  vendorSlug: string;
  verified: boolean;
  location: string;
  rating: number;
  reviewCount: number;
  sellingMethod: "checkout" | "external" | "whatsapp";
  sponsored?: boolean;
  estimatedDeliveryDays?: number;
};

export type Category = { id: string; name: string; slug: string; icon: string };

export const categories: Category[] = [
  { id: "1", name: "Phones & Tablets", slug: "phones-tablets", icon: "Smartphone" },
  { id: "2", name: "Electronics", slug: "electronics", icon: "Cpu" },
  { id: "3", name: "Fashion", slug: "fashion", icon: "Shirt" },
  { id: "4", name: "Home & Living", slug: "home-living", icon: "Sofa" },
  { id: "5", name: "Beauty & Health", slug: "beauty-health", icon: "Sparkles" },
  { id: "6", name: "Vehicles", slug: "vehicles", icon: "Car" },
  { id: "7", name: "Gaming", slug: "gaming", icon: "Gamepad2" },
  { id: "8", name: "Services", slug: "services", icon: "Wrench" },
];

export function formatNaira(amount: number) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "₦0";
  return `₦${new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(value)}`;
}
