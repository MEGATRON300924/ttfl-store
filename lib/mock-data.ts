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
};

export type Category = { id: string; name: string; slug: string; icon: string };

export type Store = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  rating: number;
  productCount: number;
  location: string;
};

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

export const products: Product[] = [
  {
    id: "p1",
    slug: "iphone-15-128gb",
    name: "iPhone 15 128GB — Midnight",
    price: 780000,
    previousPrice: 895000,
    image: "https://images.unsplash.com/photo-1592286927505-1def25115481?w=600&q=80",
    vendor: "Lagos Mobile Hub",
    vendorSlug: "lagos-mobile-hub",
    verified: true,
    location: "Lagos",
    rating: 4.8,
    reviewCount: 212,
    sellingMethod: "checkout",
  },
  {
    id: "p2",
    slug: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5 Headphones",
    price: 265000,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80",
    vendor: "AudioWorks NG",
    vendorSlug: "audioworks-ng",
    verified: true,
    location: "Abuja",
    rating: 4.9,
    reviewCount: 98,
    sellingMethod: "checkout",
  },
  {
    id: "p3",
    slug: "office-desk-chair",
    name: "Ergonomic Mesh Office Chair",
    price: 95000,
    previousPrice: 120000,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80",
    vendor: "Furnish Co.",
    vendorSlug: "furnish-co",
    verified: false,
    location: "Port Harcourt",
    rating: 4.4,
    reviewCount: 41,
    sellingMethod: "whatsapp",
  },
  {
    id: "p4",
    slug: "sneaker-air-runner",
    name: "AirRunner Street Sneakers",
    price: 42000,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    vendor: "StepUp Footwear",
    vendorSlug: "stepup-footwear",
    verified: true,
    location: "Ibadan",
    rating: 4.6,
    reviewCount: 134,
    sellingMethod: "checkout",
  },
  {
    id: "p5",
    slug: "gaming-laptop-rtx",
    name: "16\" Gaming Laptop, RTX Graphics",
    price: 1450000,
    previousPrice: 1620000,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
    vendor: "ByteForge PCs",
    vendorSlug: "byteforge-pcs",
    verified: true,
    location: "Lagos",
    rating: 4.7,
    reviewCount: 76,
    sellingMethod: "external",
  },
  {
    id: "p6",
    slug: "skincare-bundle",
    name: "Glow Skincare Starter Bundle",
    price: 18500,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    vendor: "Bare Beauty",
    vendorSlug: "bare-beauty",
    verified: false,
    location: "Enugu",
    rating: 4.3,
    reviewCount: 59,
    sellingMethod: "whatsapp",
  },
];

export const stores: Store[] = [
  { id: "s1", name: "Lagos Mobile Hub", slug: "lagos-mobile-hub", verified: true, rating: 4.8, productCount: 340, location: "Lagos" },
  { id: "s2", name: "ByteForge PCs", slug: "byteforge-pcs", verified: true, rating: 4.7, productCount: 128, location: "Lagos" },
  { id: "s3", name: "AudioWorks NG", slug: "audioworks-ng", verified: true, rating: 4.9, productCount: 76, location: "Abuja" },
  { id: "s4", name: "StepUp Footwear", slug: "stepup-footwear", verified: true, rating: 4.6, productCount: 210, location: "Ibadan" },
];

export function formatNaira(amount: number) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "₦0";

  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}
