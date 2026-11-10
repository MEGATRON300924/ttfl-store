"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { ProductForm, type ProductFormValues } from "@/components/product-form";
import type { ApiProduct, ProductStatus } from "@/lib/api-types";
import type { ProductVariation } from "@/components/product-variations";
import { isVideoUrl } from "@/lib/media";

function parseVariations(value: Record<string, string> | null): ProductVariation[] {
  if (!value?._variations) return [];
  try {
    const parsed = JSON.parse(value._variations);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.key === "string" && item.options && typeof item.options === "object").map((item) => ({ key: String(item.key), label: String(item.label ?? Object.values(item.options).join(" / ")), options: item.options as Record<string, string>, price: String(item.price ?? ""), imageUrl: item.imageUrl ? String(item.imageUrl) : undefined }));
  } catch { return []; }
}

export default function EditProductPage(){
  const params=useParams<{id:string}>();
  const[initial,setInitial]=useState<Partial<ProductFormValues>|null>(null);
  const[status,setStatus]=useState<ProductStatus>("ACTIVE");
  const[stock,setStock]=useState(0);
  const[availabilityLoading,setAvailabilityLoading]=useState(false);
  const[availabilityError,setAvailabilityError]=useState<string|null>(null);

  useEffect(()=>{
    api.get<{products:ApiProduct[]}>("/api/products/me/list").then(({products})=>{
      const product=products.find(p=>p.id===params.id);
      if(!product)return;
      setStatus(product.status);
      setStock(product.stock);
      setInitial({name:product.name,brand:product.specifications?.brand??"",specifications:product.specifications??{},variations:parseVariations(product.specifications),description:product.description,categorySlug:product.category.slug,price:String(product.price),previousPrice:product.previousPrice?String(product.previousPrice):"",euPrice:product.euPrice?String(product.euPrice):"",euPreviousPrice:product.euPreviousPrice?String(product.euPreviousPrice):"",usPrice:product.usPrice?String(product.usPrice):"",usPreviousPrice:product.usPreviousPrice?String(product.usPreviousPrice):"",euDeliveryFee:product.euDeliveryFee==null?"":String(product.euDeliveryFee),usDeliveryFee:product.usDeliveryFee==null?"":String(product.usDeliveryFee),condition:product.condition,stock:String(product.stock),location:product.location??"",images:product.images.filter(i=>!isVideoUrl(i.url)).map(i=>({url:i.url,publicId:`existing-${i.id}`})),videos:product.images.filter(i=>isVideoUrl(i.url)).map(i=>({url:i.url,publicId:`existing-${i.id}`})),tags:product.tags??[],sellingMethod:product.sellingMethod,externalUrl:product.externalUrl??"",whatsappNumber:product.whatsappNumber??"",estimatedDeliveryDays:String(product.estimatedDeliveryDays??7),deliveryFee:product.deliveryFee == null ? "" : String(product.deliveryFee),comingSoon:Boolean(product.comingSoon),availableAt:product.availableAt?new Date(product.availableAt).toISOString().slice(0,16):""});
    }).catch((error)=>setAvailabilityError(error instanceof ApiError ? error.message : "Unable to load this product."));
  },[params.id]);

  async function toggleAvailability(){
    setAvailabilityError(null);
    const markingAvailable=status==="OUT_OF_STOCK";
    if(markingAvailable&&stock<=0){
      setAvailabilityError("Update the stock quantity to at least 1 before marking this product as available.");
      return;
    }
    setAvailabilityLoading(true);
    try{
      const nextStatus:ProductStatus=markingAvailable?"ACTIVE":"OUT_OF_STOCK";
      await api.patch(`/api/products/${params.id}`,{status:nextStatus});
      setStatus(nextStatus);
    }catch(error){
      setAvailabilityError(error instanceof ApiError?error.message:"Unable to update product availability. Please try again.");
    }finally{
      setAvailabilityLoading(false);
    }
  }

  return <div className="shell max-w-2xl py-8">
    <h1 className="text-xl font-bold text-graphite-900">Edit product</h1>
    {initial&&<section className="mt-5 rounded-xl border border-graphite-200 bg-white p-4 dark:border-graphite-700 dark:bg-graphite-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-graphite-900 dark:text-white">Product availability</p>
          <p className="mt-1 text-xs text-graphite-500 dark:text-graphite-400">{status==="OUT_OF_STOCK"?"Customers will see this product as sold out.":"This product is currently available to customers."}</p>
        </div>
        <button type="button" onClick={toggleAvailability} disabled={availabilityLoading} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${status==="OUT_OF_STOCK"?"border border-graphite-300 text-graphite-800 hover:bg-cloud-100 dark:border-graphite-600 dark:text-white dark:hover:bg-graphite-800":"bg-graphite-900 text-white hover:bg-graphite-700"}`}>
          {availabilityLoading?"Saving…":status==="OUT_OF_STOCK"?"Mark as Available":"Mark as Sold Out"}
        </button>
      </div>
      {status==="OUT_OF_STOCK"&&<span className="mt-3 inline-flex rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold tracking-wide text-red-700">SOLD OUT</span>}
      {availabilityError&&<p role="alert" className="mt-3 text-sm text-red-600">{availabilityError}</p>}
    </section>}
    <div className="mt-6">{initial?<ProductForm productId={params.id} initial={initial}/>:<p className="text-sm text-graphite-600">Loading…</p>}</div>
  </div>
}
