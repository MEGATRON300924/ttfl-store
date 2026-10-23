"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { TextField } from "@/components/text-field";
import { ImageUploadField, type UploadedImage } from "@/components/image-upload-field";
import { VideoUploadField, type UploadedVideo } from "@/components/video-upload-field";
import { ProductSpecifications } from "@/components/product-specifications";
import { ProductVariations, type ProductVariation } from "@/components/product-variations";
import type { ApiCategory, SellingMethod, ProductCondition } from "@/lib/api-types";

export type ProductListingType = "normal" | "coming-soon" | "pre-order";

export type ProductFormValues = {
  name: string; brand: string; specifications: Record<string,string>; description: string; categorySlug: string; price: string; previousPrice: string; euPrice: string; euPreviousPrice: string;
  condition: ProductCondition; stock: string; location: string; deliveryFee: string; images: UploadedImage[]; videos: UploadedVideo[]; variations: ProductVariation[];
  tags: string[]; sellingMethod: SellingMethod; externalUrl: string; whatsappNumber: string; estimatedDeliveryDays: string;
  comingSoon: boolean; availableAt: string;
};
const EMPTY: ProductFormValues = {
  name: "", brand: "", specifications: {}, description: "", categorySlug: "", price: "", previousPrice: "", euPrice: "", euPreviousPrice: "", condition: "NEW", stock: "1",
  location: "", deliveryFee: "", images: [], videos: [], variations: [], tags: [], sellingMethod: "CHECKOUT", externalUrl: "", whatsappNumber: "", estimatedDeliveryDays: "7",
  comingSoon: false, availableAt: "",
};

export function ProductForm({ productId, initial, redirectTo, productType }: { productId?: string; initial?: Partial<ProductFormValues>; redirectTo?: string; productType?: ProductListingType }) {
  const router = useRouter(); const [categories, setCategories] = useState<ApiCategory[]>([]); const [loadingCategories, setLoadingCategories] = useState(true); const [supportsEU, setSupportsEU] = useState(false);
  const [form, setForm] = useState<ProductFormValues>({ ...EMPTY, ...initial }); const [preOrderReleaseDate, setPreOrderReleaseDate] = useState(""); const [preOrderTerms, setPreOrderTerms] = useState("Full payment is collected at checkout. The vendor will fulfil the order on or after the expected release date."); const [tagInput, setTagInput] = useState(""); const [error, setError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  useEffect(() => { let active = true; api.get<{ supportedCountries?: string[] }>("/api/vendors/me/markets").then((response) => { if (active) setSupportsEU(Boolean(response.supportedCountries?.includes("EU"))); }).catch(() => { if (active) setSupportsEU(false); }); return () => { active = false; }; }, []);
  useEffect(() => { let mounted = true; async function loadCategories() { try { setLoadingCategories(true); const response = await api.get<{ categories: ApiCategory[] }>("/api/categories"); if (mounted) setCategories(response.categories); } catch (err) { if (mounted) setError(err instanceof ApiError ? err.message : "Unable to load product categories. Please refresh the page and try again."); } finally { if (mounted) setLoadingCategories(false); } } void loadCategories(); return () => { mounted = false; }; }, []);
  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function addTagsFromInput(value: string) { const incoming = value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean); if (!incoming.length) return; setForm((current) => ({ ...current, tags: Array.from(new Set([...current.tags, ...incoming])).slice(0, 20) })); setTagInput(""); }
  function removeTag(tag: string) { setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) })); }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    if (!form.name.trim() || form.name.trim().length < 3) return setError("Product name must be at least 3 characters.");
    if (form.brand.trim().length > 80) return setError("Brand name is too long.");
    if (!form.description.trim() || form.description.trim().length < 10) return setError("Product description must be at least 10 characters.");
    if (!form.categorySlug) return setError("Please choose a product category.");
    if (!(productType === "coming-soon" || (!productType && form.comingSoon)) && (!form.price || Number(form.price) <= 0)) return setError("Please enter a valid product price.");
    if (supportsEU && !(productType === "coming-soon" || (!productType && form.comingSoon)) && (!form.euPrice || Number(form.euPrice) <= 0)) return setError("Please enter a valid EU price because your store supports the Europe.");
    if (productType === "pre-order") {
      if (form.sellingMethod !== "CHECKOUT") return setError("Native pre-orders must use TTFL Store checkout. External links and WhatsApp sales cannot use the pre-order workflow.");
      if (!preOrderReleaseDate) return setError("Please set the expected release date for this pre-order.");
      if (new Date(preOrderReleaseDate).getTime() <= Date.now()) return setError("The expected release date must be in the future.");
      if (preOrderTerms.trim().length < 10) return setError("Please explain the pre-order payment and fulfilment terms.");
    }
    if (form.previousPrice && Number(form.previousPrice) <= Number(form.price)) return setError("PrevioEurope price must be greater than the current price.");
    if (form.euPreviousPrice && (!form.euPrice || Number(form.euPreviousPrice) <= Number(form.euPrice))) return setError("EU previoEurope price must be greater than the EU price.");
    if (Number(form.stock) < 0) return setError("Stock cannot be negative.");
    if (form.deliveryFee.trim() && (!Number.isFinite(Number(form.deliveryFee)) || Number(form.deliveryFee) < 0)) return setError("Shipping fee must be zero or a positive amount.");
    if (form.images.length === 0) return setError("Please add at least one product photo.");
    if (form.videos.length > 3) return setError("You can add up to 3 product videos.");
    if (form.variations.some((variant) => variant.price && Number(variant.price) < 0)) return setError("Variation prices cannot be negative.");
    const deliveryDays = Number(form.estimatedDeliveryDays); if (!Number.isInteger(deliveryDays) || deliveryDays < 1 || deliveryDays > 90) return setError("Estimated delivery must be between 1 and 90 days.");
    if (form.sellingMethod === "EXTERNAL_LINK" && !form.externalUrl.trim()) return setError("Please enter the product URL for the external link.");
    if (form.sellingMethod === "EXTERNAL_LINK") { try { new URL(form.externalUrl.trim()); } catch { return setError("Please enter a valid external purchase URL."); } }
    if (form.sellingMethod === "WHATSAPP" && form.whatsappNumber.trim() && form.whatsappNumber.trim().length < 7) return setError("Please enter a valid WhatsApp number.");
    if (form.variations.length > 0 && form.variations.some((variant) => Object.values(variant.options).some((value) => !value.trim()))) return setError("Please complete all variation values before saving.");
    addTagsFromInput(tagInput);
    setSubmitting(true);
    const images = form.images.map((image) => image.url).filter(Boolean); const videos = form.videos.map((video) => video.url).filter(Boolean); const tags = Array.from(new Set([...form.tags, ...tagInput.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean)])).slice(0, 20);
    const specifications = { ...form.specifications };
    const selectedBrand = form.brand.trim();
    const customBrand = String(specifications.customBrand ?? "").trim();
    const effectiveBrand =
      selectedBrand.toLowerCase() === "other"
        ? customBrand
        : selectedBrand || String(specifications.brand ?? "").trim();

    if (effectiveBrand) specifications.brand = effectiveBrand;
    else delete specifications.brand;
    if (form.variations.length) specifications._variations = JSON.stringify(form.variations);
    else delete specifications._variations;
    if (productType) {
      specifications._productType = productType;
      if (productType === "pre-order") {
        specifications._preOrderReleaseDate = new Date(preOrderReleaseDate).toISOString();
        specifications._preOrderPaymentModel = "FULL_PAYMENT";
        specifications._preOrderTerms = preOrderTerms.trim();
      } else {
        delete specifications._preOrderReleaseDate;
        delete specifications._preOrderPaymentModel;
        delete specifications._preOrderTerms;
      }
    }

    const rawName = form.name.trim();
    const brand = effectiveBrand;
    // "Other" is a category/type fallback, not part of the customer-facing product name.
    // Keep the selected category in product metadata for SEO instead of repeating it in the title.
    const categoryIsOther = selectedCategory?.name.trim().toLowerCase() === "other";
    const cleanName = categoryIsOther
      ? rawName.replace(/^other[\\s:–—-]+/i, "").trim()
      : rawName;
    const searchableName =
      brand && !cleanName.toLowerCase().startsWith(`${brand.toLowerCase()} `)
        ? `${brand} ${cleanName}`
        : cleanName;
    const payload: Record<string, unknown> = { name: searchableName, description: form.description.trim(), categorySlug: form.categorySlug, price: form.price.trim() ? Number(form.price) : 0, condition: form.condition, stock: Number(form.stock), images, videos, tags, specifications, sellingMethod: form.sellingMethod, estimatedDeliveryDays: deliveryDays, deliveryFee: form.deliveryFee.trim() ? Number(form.deliveryFee) : null, comingSoon: productType ? productType === "coming-soon" : form.comingSoon, availableAt: form.availableAt ? new Date(form.availableAt).toISOString() : null };
    if (form.previousPrice.trim()) payload.previousPrice = Number(form.previousPrice); if (supportsEU && form.euPrice.trim()) payload.euPrice = Number(form.euPrice); if (supportsEU && form.euPreviousPrice.trim()) payload.euPreviousPrice = Number(form.euPreviousPrice); if (form.location.trim()) payload.location = form.location.trim(); if (form.sellingMethod === "EXTERNAL_LINK") payload.externalUrl = form.externalUrl.trim(); if (form.sellingMethod === "WHATSAPP" && form.whatsappNumber.trim()) payload.whatsappNumber = form.whatsappNumber.trim();
    try { let savedProductId = productId; if (productId) await api.patch(`/api/products/${productId}`, payload); else { const response = await api.post<{ product: { id: string } }>("/api/products", payload); savedProductId = response.product.id; } if (savedProductId) await api.post(`/api/products/${savedProductId}/videos`, { videos }); router.push(redirectTo || "/vendor/dashboard/products"); }
    catch (err) { setError(err instanceof ApiError ? err.message : "Something went wrong while saving the product."); setSubmitting(false); }
  }
  const selectedCategory = categories.flatMap((category) => [category, ...(category.children ?? [])]).find((category) => category.slug === form.categorySlug);
  return <form onSubmit={handleSubmit} className="flex flex-col gap-4">
    <TextField label="Product name" value={form.name} onChange={(value) => set("name", value)} hint="Enter the model/product name. The selected brand will also be included for search discovery." />
    <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700 dark:text-graphite-300">Description</span><span className="text-xs text-graphite-500 dark:text-graphite-400">Supports Markdown formatting: **bold**, *italic*, # headings, - bullet lists, 1. numbered lists, `code`, links and emojis/unicode.</span><textarea required rows={8} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder={"Example:\n**Key Features**\n- Fast performance ⚡\n- Premium design\n\nGreat for everyday use."} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label>
    <fieldset className="flex flex-col gap-2 text-sm" disabled={loadingCategories || categories.length === 0}>
      <legend className="mb-1 font-medium text-graphite-700 dark:text-graphite-300">Category <span className="text-ember-600">*</span></legend>
      <p className="text-xs text-graphite-500 dark:text-graphite-400">Choose the category that best describes your product.</p>
      {loadingCategories ? <div className="rounded-xl border border-graphite-200 p-4 text-graphite-500 dark:border-graphite-700">Loading categories…</div> : categories.length === 0 ? <div className="rounded-xl border border-graphite-200 p-4 text-graphite-500 dark:border-graphite-700">No categories are available right now.</div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {categories.flatMap((category) => [category, ...(category.children ?? [])]).map((category) => {
          const selected = form.categorySlug === category.slug;
          return <button key={category.id} type="button" aria-pressed={selected} onClick={() => set("categorySlug", category.slug)} className={`group flex min-h-[76px] items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 ${selected ? "border-ember-600 bg-ember-50 ring-1 ring-ember-600 dark:bg-ember-950/30" : "border-graphite-200 bg-white hover:border-ember-300 hover:bg-cloud-50 dark:border-graphite-700 dark:bg-graphite-900 dark:hover:bg-graphite-800"}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${selected ? "bg-ember-600 text-white" : "bg-cloud-100 text-graphite-600 group-hover:text-ember-600 dark:bg-graphite-800 dark:text-graphite-300"}`}><span className="text-base font-semibold">{category.name.trim().charAt(0).toUpperCase()}</span></span>
            <span className="min-w-0 flex-1"><span className={`block line-clamp-2 font-semibold ${selected ? "text-ember-700 dark:text-ember-300" : "text-graphite-800 dark:text-graphite-100"}`}>{category.name}</span>{category.children?.length ? <span className="mt-0.5 block text-[11px] text-graphite-500">{category.children.length} subcategories</span> : null}</span>
            {selected && <span className="text-ember-600" aria-hidden="true">✓</span>}
          </button>;
        })}
      </div>}
      <input type="hidden" required value={form.categorySlug} readOnly aria-label="Selected category" />
    </fieldset>
    <ProductSpecifications categoryName={selectedCategory?.name} productName={form.name} specifications={form.specifications} onChange={(specifications) => set("specifications", specifications)} />
    <ProductVariations categoryName={selectedCategory?.name} categoryConfig={selectedCategory?.variationConfig} value={form.variations} onChange={(variations) => set("variations", variations)} />
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><TextField label={productType === "coming-soon" || form.comingSoon ? "Nigerian price (₦, optional)" : "Nigerian price (₦)"} type="number" value={form.price} onChange={(value) => set("price", value)} optional={productType === "coming-soon" || form.comingSoon} hint={productType === "coming-soon" || form.comingSoon ? "You can set the Nigerian price now or before launch." : undefined} /><TextField label="PrevioEurope price (₦)" type="number" value={form.previousPrice} onChange={(value) => set("previousPrice", value)} optional hint="Only enter this if discounted." />{supportsEU && <><TextField label={productType === "coming-soon" || form.comingSoon ? "EU price ($, optional)" : "EU price ($)"} type="number" value={form.euPrice} onChange={(value) => set("euPrice", value)} optional={productType === "coming-soon" || form.comingSoon} hint="Set a separate EUD price for EU customers." /><TextField label="PrevioEurope price ($)" type="number" value={form.euPreviousPrice} onChange={(value) => set("euPreviousPrice", value)} optional hint="Only enter this if discounted." /></>}</div>
    <div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700 dark:text-graphite-300">Condition</span><select value={form.condition} onChange={(e) => set("condition", e.target.value as ProductCondition)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white"><option value="NEW">New</option><option value="USED">Used</option></select></label><TextField label={productType === "pre-order" ? "Pre-order quantity limit" : "Stock"} type="number" value={form.stock} onChange={(value) => set("stock", value)} hint={productType === "pre-order" ? "Maximum number of reservations customers can place." : undefined} /></div>
    <TextField label="Location" value={form.location} onChange={(value) => set("location", value)} optional hint="Optional — e.g. Lagos, Abuja, Port Harcourt." />
    <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><div className="text-sm font-medium text-graphite-700 dark:text-graphite-300">Search tags</div><p className="mt-1 text-xs text-graphite-500 dark:text-graphite-400">Add words customers might search for. Example: laptop, laptops, HP, MacBook, computer, notebook.</p><div className="mt-3 flex gap-2"><input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTagsFromInput(tagInput); } }} placeholder="Type a tag and press Enter" className="min-w-0 flex-1 rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /><button type="button" onClick={() => addTagsFromInput(tagInput)} className="rounded-[7px] border border-graphite-200 px-4 py-2 text-sm font-semibold hover:bg-cloud-100 dark:border-graphite-700 dark:hover:bg-graphite-800">Add</button></div>{form.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{form.tags.map((tag) => <button key={tag} type="button" onClick={() => removeTag(tag)} className="rounded-full bg-cloud-100 px-3 py-1 text-xs font-medium text-graphite-700 hover:bg-ember-100 hover:text-ember-700 dark:bg-graphite-800 dark:text-graphite-200">{tag} ×</button>)}</div>}</div>
    <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><TextField label="Product shipping fee (₦)" type="number" value={form.deliveryFee} onChange={(value) => set("deliveryFee", value)} optional hint="Leave blank to use TTFL Store’s standard delivery fee. Enter 0 to offer free shipping for this product." /><div className="mt-3"><TextField label="Estimated delivery (days)" type="number" value={form.estimatedDeliveryDays} onChange={(value) => set("estimatedDeliveryDays", value)} hint="Customers will see an estimated delivery date." /></div></div>
    {productType === "pre-order" ? <div className="rounded-card border border-ember-200 bg-ember-50/60 p-4 dark:border-ember-900/60 dark:bg-ember-950/20"><p className="text-sm font-semibold text-graphite-900 dark:text-white">Pre-order settings</p><p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-400">Customers pay in full through TTFL Store checkout to reserve a unit. Use the stock field as the number of pre-orders you are willing to accept.</p><div className="mt-4 flex flex-col gap-3"><TextField label="Expected release date" type="datetime-local" value={preOrderReleaseDate} onChange={setPreOrderReleaseDate} hint="This is when you expect the product to be ready, not a guaranteed delivery date." /><label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700 dark:text-graphite-300">Payment and fulfilment terms</span><textarea required rows={3} value={preOrderTerms} onChange={(e) => setPreOrderTerms(e.target.value)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white" /></label><p className="text-xs text-graphite-500 dark:text-graphite-400">Payment model for this first release: full payment at checkout. Deposit and pay-later options are not enabled yet.</p></div></div> : productType === "coming-soon" ? <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><p className="text-sm font-semibold text-graphite-900 dark:text-white">Coming Soon listing</p><p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-400">Customers can join the waitlist. No order is placed and no payment is collected.</p><div className="mt-3"><TextField label="Expected availability" type="datetime-local" value={form.availableAt} onChange={(value) => set("availableAt", value)} optional hint="Optional. You can make the product available manually or through a launch campaign." /></div></div> : productType === "normal" ? <div className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><p className="text-sm font-semibold text-graphite-900 dark:text-white">Ready to sell</p><p className="mt-1 text-xs leading-5 text-graphite-600 dark:text-graphite-400">Customers can buy this product now using your selected buying method.</p></div> : <div className="rounded-card border border-ember-200 bg-ember-50/60 p-4 dark:border-ember-900/60 dark:bg-ember-950/20"><label className="flex items-start gap-3"><input type="checkbox" checked={form.comingSoon} onChange={(e) => set("comingSoon", e.target.checked)} className="mt-1 h-4 w-4" /><span><span className="block text-sm font-semibold text-graphite-900 dark:text-white">Coming soon</span><span className="mt-1 block text-xs leading-5 text-graphite-600 dark:text-graphite-400">Use this for products announced before launch. Customers can view the product and tap Notify me instead of buying it.</span></span></label>{form.comingSoon && <div className="mt-4"><TextField label="Expected availability" type="datetime-local" value={form.availableAt} onChange={(value) => set("availableAt", value)} optional hint="Optional. You can make the product available manually or through a launch campaign." /></div>}</div>}
    <ImageUploadField images={form.images} onChange={(images) => set("images", images)} />
    {form.images.length === 0 && <p className="text-xs text-ember-600">Add at least one product photo.</p>}
    <VideoUploadField videos={form.videos} onChange={(videos) => set("videos", videos)} />
    <fieldset className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700"><legend className="px-1 text-sm font-semibold text-graphite-900 dark:text-white">How do customers buy this?</legend>{productType === "pre-order" && <p className="mt-1 text-xs text-graphite-500">Pre-orders must use TTFL Store checkout so payment and order status stay on-platform.</p>}<div className="mt-2 flex flex-col gap-2">{([{ value: "CHECKOUT", label: "TTFL Store checkout — customer pays through the site" }, { value: "EXTERNAL_LINK", label: "External link — send them to my own website" }, { value: "WHATSAPP", label: "WhatsApp — chat to close the sale" }] as const).map((option) => <label key={option.value} className="flex items-center gap-2 text-sm text-graphite-700 dark:text-graphite-300"><input type="radio" name="sellingMethod" checked={form.sellingMethod === option.value} disabled={productType === "pre-order" && option.value !== "CHECKOUT"} onChange={() => set("sellingMethod", option.value)} />{option.label}</label>)}</div>{form.sellingMethod === "EXTERNAL_LINK" && <div className="mt-3"><TextField label="Product URL on your website" value={form.externalUrl} onChange={(value) => set("externalUrl", value)} hint="Required only when External link is selected." /></div>}{form.sellingMethod === "WHATSAPP" && <div className="mt-3"><TextField label="WhatsApp number for this product" value={form.whatsappNumber} onChange={(value) => set("whatsappNumber", value)} optional hint="Optional — if blank, your store's WhatsApp number will be used." /></div>}</fieldset>
    {error && <p role="alert" className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700">{error}</p>}
    <button type="submit" disabled={submitting || loadingCategories || categories.length === 0} className="rounded-card bg-ember-600 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Saving…" : productId ? "Save changes" : productType === "pre-order" ? "Publish pre-order" : productType === "coming-soon" ? "Create Coming Soon product" : "List product"}</button>
  </form>;
}
