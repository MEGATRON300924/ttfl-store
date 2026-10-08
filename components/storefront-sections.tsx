import Link from "next/link";
import type { ApiProduct } from "@/lib/api-types";
import { ProductCard } from "@/components/product-card";
import { CalendarDays, Megaphone, Sparkles, Store as StoreIcon } from "lucide-react";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));
}

function sanitizeHtml(value: string) {
  return value
    .slice(0, 60000)
    .replace(/<!--[\\s\\S]*?-->/g, "")
    .replace(/<\\/?(script|iframe|object|embed|applet|base|meta|link|form|input|textarea|select|option|button|style)\\b[^>]*>[\\s\\S]*?(<\\/\\s*\\1\\s*>)?/gi, "")
    .replace(/\\s+on[a-z-]+\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)/gi, "")
    .replace(/(href|src)\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))/gi, (full, name, a, b, d) => {
      const url = String(a ?? b ?? d ?? "").trim();
      return /^(https?:|mailto:|tel:|#|\\/)/i.test(url) ? full : `${name}="#"`;
    });
}

function renderProductsHtml(items: ApiProduct[]) {
  return `<div data-ttfl-products class="ttfl-products">${items.map((p) => {
    const image = p.images?.[0]?.url || "";
    const href = "/product/" + encodeURIComponent(p.slug);
    return `<a class="ttfl-product-card" href="${escapeHtml(href)}"><div class="ttfl-product-image">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(p.name)}">` : ""}</div><div class="ttfl-product-body"><strong>${escapeHtml(p.name)}</strong><span>₦${Number(p.price).toLocaleString("en-NG")}</span></div></a>`;
  }).join("")}</div>`;
}

function CustomStorefrontHtml({ code, vendor, items }: { code: string; vendor: any; items: ApiProduct[] }) {
  if (!code.trim()) return null;
  const replacements: Record<string, string> = {
    "{my-store-name}": escapeHtml(vendor.storeName),
    "{my-store-slug}": escapeHtml(vendor.storeSlug),
    "{my-store-description}": escapeHtml(vendor.description ?? vendor.bio ?? ""),
    "{my-store-location}": escapeHtml(vendor.location ?? ""),
    "{my-store-logo}": vendor.logoUrl ? `<img src="${escapeHtml(vendor.logoUrl)}" alt="${escapeHtml(vendor.storeName)} logo">` : "",
    "{my-store-banner}": vendor.storefront?.banner?.imageUrl ? `<img src="${escapeHtml(vendor.storefront.banner.imageUrl)}" alt="">` : "",
    "{my-products}": renderProductsHtml(items),
    "{my-featured-products}": renderProductsHtml(items.slice(0, 8)),
    "{my-best-sellers}": renderProductsHtml([...items].sort((a,b) => Number(b.viewCount || 0) - Number(a.viewCount || 0)).slice(0, 8)),
    "{my-store-url}": escapeHtml("/store/" + vendor.storeSlug),
    "{my-whatsapp}": vendor.whatsappNumber ? `<a href="https://wa.me/${escapeHtml(vendor.whatsappNumber.replace(/\\D/g, ""))}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>` : "",
  };
  const html = sanitizeHtml(Object.entries(replacements).reduce((result, [token, value]) => result.split(token).join(value), code));
  return <section className="ttfl-custom-html rounded-[24px]">{/* Vendor HTML is sanitized server-side and again here before rendering. */}<div dangerouslySetInnerHTML={{ __html: html }} /></section>;
}

type Props={sections:any[];items:ApiProduct[];vendor:any;dark:boolean;accent:string;businessHours?:any[];};
export function StorefrontSections({sections,items,vendor,dark,accent,businessHours=[]}:Props){
 const panel=dark?"border-white/10 bg-graphite-900":"border-graphite-200 bg-white";const muted=dark?"text-graphite-300":"text-graphite-600";const enabled=sections?.filter((s:any)=>s.enabled)??[];
 const renderProducts=(section:any)=>{
   let list=items;
   if(Array.isArray(section.productIds)&&section.productIds.length) list=items.filter(p=>section.productIds.includes(p.id));
   if(section.type==="BEST_SELLERS") list=[...list].sort((a,b)=>Number(b.viewCount||0)-Number(a.viewCount||0));
   if(section.type==="CATEGORY"&&section.categoryId) list=list.filter(p=>p.category?.id===section.categoryId);
   if(!list.length)return <div className={"rounded-card border border-dashed p-8 text-center "+(dark?"border-white/10":"border-graphite-200")}><StoreIcon className="mx-auto h-8 w-8 opacity-30"/><p className="mt-3 font-semibold">Nothing to show yet</p><p className={"mt-1 text-sm "+muted}>Products matching this section will appear here.</p></div>;
   const columns=Math.min(5,Math.max(1,Number(vendor.storefront?.layout?.desktopColumns??4)));
   return <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" style={{gridTemplateColumns:"repeat("+columns+",minmax(0,1fr))"}}>{list.map(p=><ProductCard key={p.id} product={{id:p.id,slug:p.slug,name:p.name,price:Number(p.price),previousPrice:p.previousPrice?Number(p.previousPrice):undefined,image:p.images[0]?.url??"",vendor:p.vendor.storeName,vendorSlug:p.vendor.storeSlug,verified:p.vendor.verified,location:p.location??"",rating:Number(p.avgRating??0),reviewCount:p.reviewCount??0,sellingMethod:p.sellingMethod==="EXTERNAL_LINK"?"external":p.sellingMethod==="WHATSAPP"?"whatsapp":"checkout"}}/>)}</div>;
 };
 return <div className="space-y-6">{vendor.storefront?.customHtml?.enabled && vendor.storefront?.customHtml?.code && <CustomStorefrontHtml code={vendor.storefront.customHtml.code} vendor={vendor} items={items}/>} {enabled.map((section:any)=>{switch(section.type){
 case "ABOUT":return <section key={section.id} className={"rounded-card border p-5 sm:p-6 "+panel}><div className="flex items-center gap-2"><Sparkles className="h-4 w-4" style={{color:accent}}/><h2 className="font-bold">{section.title||"About this store"}</h2></div><p className={"mt-3 text-sm leading-7 "+muted}>{vendor.description??vendor.bio??vendor.headline??"Tell customers what makes your store special."}</p></section>;
 case "HOURS":return <section key={section.id} className={"rounded-card border p-5 sm:p-6 "+panel}><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" style={{color:accent}}/><h2 className="font-bold">{section.title||"Business hours"}</h2></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{businessHours.map(h=><div key={h.dayOfWeek} className={"rounded-xl p-3 "+(dark?"bg-graphite-800":"bg-cloud-50")}><p className="text-xs font-semibold">{h.day.slice(0,3)}</p><p className={"mt-1 text-xs "+muted}>{h.isOpen?h.openTime+"–"+h.closeTime:"Closed"}</p></div>)}</div></section>;
 case "BANNER":return <section key={section.id} className="relative overflow-hidden rounded-[24px] bg-graphite-950 p-7 text-white sm:p-9" style={section.banner?.imageUrl?{backgroundImage:"linear-gradient(rgba(0,0,0,.42),rgba(0,0,0,.42)),url("+section.banner.imageUrl+")",backgroundSize:"cover",backgroundPosition:"center"}:undefined}><div className="relative"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]"><Megaphone className="h-4 w-4"/>{section.title||"Promotion"}</div><p className="mt-3 text-xl font-bold">{section.banner?.title||"Special offers from "+vendor.storeName}</p>{section.banner?.subtitle&&<p className="mt-2 max-w-xl text-sm text-white/85">{section.banner.subtitle}</p>}</div></section>;
 case "FEATURED":case "BEST_SELLERS":case "CATEGORY":case "PRODUCTS":return <section key={section.id}><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold">{section.title||"Shop this store"}</h2><p className={"mt-1 text-sm "+muted}>{section.type==="BEST_SELLERS"?"Popular products from this store":section.type==="FEATURED"?"Hand-picked products from this store":"Products currently available"}</p></div><Link href={"/stores/"+encodeURIComponent(vendor.storeSlug)+"/reviews"} className="text-sm font-semibold" style={{color:accent}}>Reviews →</Link></div>{renderProducts(section)}</section>;
 default:return null;
 }})}</div>;
}
