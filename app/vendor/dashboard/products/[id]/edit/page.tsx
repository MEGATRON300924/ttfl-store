"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { ProductForm, type ProductFormValues } from "@/components/product-form";
import type { ApiProduct } from "@/lib/api-types";
import type { ProductVariation } from "@/components/product-variations";
import { isVideoUrl } from "@/lib/media";

function parseVariations(value: Record<string, string> | null): ProductVariation[] {
  if (!value?._variations) return [];
  try {
    const parsed = JSON.parse(value._variations);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.key === "string" && item.options && typeof item.options === "object").map((item) => ({ key: String(item.key), label: String(item.label ?? Object.values(item.options).join(" / ")), options: item.options as Record<string, string>, price: String(item.price ?? "") }));
  } catch { return []; }
}

export default function EditProductPage(){
  const params=useParams<{id:string}>();
  const[initial,setInitial]=useState<Partial<ProductFormValues>|null>(null);
  useEffect(()=>{api.get<{products:ApiProduct[]}>("/api/products/me/list").then(({products})=>{const product=products.find(p=>p.id===params.id);if(!product)return;setInitial({name:product.name,brand:product.specifications?.brand??"",specifications:product.specifications??{},variations:parseVariations(product.specifications),description:product.description,categorySlug:product.category.slug,price:String(product.price),previousPrice:product.previousPrice?String(product.previousPrice):"",condition:product.condition,stock:String(product.stock),location:product.location??"",images:product.images.filter(i=>!isVideoUrl(i.url)).map(i=>({url:i.url,publicId:`existing-${i.id}`})),videos:product.images.filter(i=>isVideoUrl(i.url)).map(i=>({url:i.url,publicId:`existing-${i.id}`})),tags:product.tags??[],sellingMethod:product.sellingMethod,externalUrl:product.externalUrl??"",whatsappNumber:product.whatsappNumber??"",estimatedDeliveryDays:String(product.estimatedDeliveryDays??7),comingSoon:Boolean(product.comingSoon),availableAt:product.availableAt?new Date(product.availableAt).toISOString().slice(0,16):""});});},[params.id]);
  return <div className="shell max-w-2xl py-8"><h1 className="text-xl font-bold text-graphite-900">Edit product</h1><div className="mt-6">{initial?<ProductForm productId={params.id} initial={initial}/>:<p className="text-sm text-graphite-600">Loading…</p>}</div></div>
}
