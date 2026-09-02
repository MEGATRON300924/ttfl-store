"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Save,
  Store,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

type UploadType = "logo" | "banner";

type StoreProfile = {
  id?: string;
  storeName: string;
  storeSlug: string;
  bio: string | null;
  location: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status?: string;
  tier?: string;
  verified?: boolean;
};

export default function VendorStoreSettingsPage() {
  const { user, loading: authLoading } = useAuth();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [store, setStore] = useState<StoreProfile | null>(null);

  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const [removing, setRemoving] = useState<UploadType | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === "VENDOR") {
      loadStore();
    }
  }, [authLoading, user]);

  async function loadStore() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/vendors/me/store");
      const data = response?.data ?? response;

      const vendorStore: StoreProfile =
        data?.vendorProfile ?? data?.store ?? data;

      if (!vendorStore) {
        throw new Error("Store information could not be loaded.");
      }

      setStore(vendorStore);

      setStoreName(vendorStore.storeName ?? "");
      setStoreSlug(vendorStore.storeSlug ?? "");
      setBio(vendorStore.bio ?? "");
      setLocation(vendorStore.location ?? "");
      setWhatsappNumber(vendorStore.whatsappNumber ?? "");

      setLogoPreview(vendorStore.logoUrl ?? null);
      setBannerPreview(vendorStore.bannerUrl ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your store settings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiClient.patch("/api/vendors/me/store", {
        storeName: storeName.trim(),
        storeSlug: storeSlug.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        whatsappNumber: whatsappNumber.trim() || null,
      });

      const data = response?.data ?? response;

      const updatedStore: StoreProfile =
        data?.vendorProfile ?? data?.store ?? data;

      if (updatedStore) {
        setStore(updatedStore);

        setStoreName(updatedStore.storeName ?? storeName);
        setStoreSlug(updatedStore.storeSlug ?? storeSlug);
        setBio(updatedStore.bio ?? "");
        setLocation(updatedStore.location ?? "");
        setWhatsappNumber(updatedStore.whatsappNumber ?? "");

        if (updatedStore.logoUrl !== undefined) {
          setLogoPreview(updatedStore.logoUrl ?? null);
        }

        if (updatedStore.bannerUrl !== undefined) {
          setBannerPreview(updatedStore.bannerUrl ?? null);
        }
      }

      setMessage("Your store settings have been saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your store settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage(null);
    setError(null);
    setUploading(type);

    try {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/avif",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload a JPG, PNG, WebP, or AVIF image.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image must be 5MB or smaller.");
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);

      const response = await apiClient.post(
        "/api/uploads/store-branding",
        formData
      );

      const data = response?.data ?? response;

      const uploadedUrl =
        data?.url ??
        data?.imageUrl ??
        data?.logoUrl ??
        data?.bannerUrl ??
        data?.vendorProfile?.[
          type === "logo" ? "logoUrl" : "bannerUrl"
        ];

      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      if (type === "logo") {
        setLogoPreview(uploadedUrl);
      } else {
        setBannerPreview(uploadedUrl);
      }

      setMessage(
        type === "logo"
          ? "Store logo updated."
          : "Store banner updated."
      );

      await loadStore();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to upload your ${type}.`
      );
    } finally {
      setUploading(null);

      if (type === "logo" && logoInputRef.current) {
        logoInputRef.current.value = "";
      }

      if (type === "banner" && bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  }

  async function handleRemove(type: UploadType) {
    setMessage(null);
    setError(null);
    setRemoving(type);

    try {
      await apiClient.delete(
        `/api/uploads/store-branding?type=${encodeURIComponent(type)}`
      );

      if (type === "logo") {
        setLogoPreview(null);
      } else {
        setBannerPreview(null);
      }

      setMessage(
        type === "logo"
          ? "Store logo removed."
          : "Store banner removed."
      );

      await loadStore();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to remove your ${type}.`
      );
    } finally {
      setRemoving(null);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="shell py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-graphite-600">
            <Loader2 className="h-5 w-5 animate-spin text-ember-600" />
            Loading your store settings...
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "VENDOR") {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">
          Vendor access only
        </h1>

        <p className="mt-1 text-sm text-graphite-600">
          Log in with a vendor account, or{" "}
          <Link
            href="/sell"
            className="font-medium text-ember-600 hover:text-ember-700"
          >
            apply to sell
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      <div className="mb-6">
        <Link
          href="/vendor/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-graphite-600 transition hover:text-ember-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-graphite-900">
              Store settings
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-graphite-600">
              Manage your storefront identity, branding, and public
              information.
            </p>
          </div>

          {store?.status && (
            <span className="inline-flex w-fit items-center gap-2 rounded-tag bg-cloud-100 px-3 py-1.5 text-xs font-semibold text-graphite-700">
              <span
                className={`h-2 w-2 rounded-full ${
                  store.status === "APPROVED"
                    ? "bg-verified-600"
                    : "bg-gold-600"
                }`}
              />

              {store.status === "APPROVED"
                ? "Store approved"
                : store.status.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-5 flex items-start gap-3 rounded-card border border-verified-600/20 bg-verified-100 p-4">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-verified-600 text-white">
            <Check className="h-4 w-4" />
          </span>

          <p className="pt-0.5 text-sm font-medium text-verified-700">
            {message}
          </p>

          <button
            type="button"
            onClick={() => setMessage(null)}
            className="ml-auto text-verified-700/70 hover:text-verified-700"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-card border border-ember-600/20 bg-ember-100 p-4">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ember-600 text-white">
            <X className="h-4 w-4" />
          </span>

          <p className="pt-0.5 text-sm font-medium text-ember-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-ember-700/70 hover:text-ember-700"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* BRANDING */}
            <section className="overflow-hidden rounded-card border border-graphite-200 bg-white shadow-card">
              <div className="border-b border-graphite-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700">
                    <ImageIcon className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="font-semibold text-graphite-900">
                      Store branding
                    </h2>

                    <p className="text-sm text-graphite-600">
                      Give your storefront a recognizable identity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {/* BANNER */}
                <div>
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold text-graphite-900">
                      Store banner
                    </h3>

                    <p className="mt-0.5 text-xs text-graphite-600">
                      Recommended size: 1600 × 600px
                    </p>
                  </div>

                  <div className="relative aspect-[16/6] overflow-hidden rounded-card border border-dashed border-graphite-200 bg-cloud-100">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Store banner"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                        <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-graphite-400 shadow-card">
                          <ImageIcon className="h-6 w-6" />
                        </span>

                        <p className="text-sm font-medium text-graphite-700">
                          No banner uploaded
                        </p>

                        <p className="mt-1 text-xs text-graphite-500">
                          JPG, PNG, WebP or AVIF · Max 5MB
                        </p>
                      </div>
                    )}

                    {uploading === "banner" && (
                      <div className="absolute inset-0 grid place-items-center bg-graphite-950/60">
                        <div className="flex items-center gap-2 rounded-card bg-white px-4 py-2.5 text-sm font-medium text-graphite-900 shadow-card">
                          <Loader2 className="h-4 w-4 animate-spin text-ember-600" />
                          Uploading...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(event) =>
                        handleUpload(event, "banner")
                      }
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={
                        uploading === "banner" ||
                        removing === "banner"
                      }
                      className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-graphite-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploading === "banner" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}

                      {bannerPreview
                        ? "Change banner"
                        : "Upload banner"}
                    </button>

                    {bannerPreview && (
                      <button
                        type="button"
                        onClick={() => handleRemove("banner")}
                        disabled={
                          uploading === "banner" ||
                          removing === "banner"
                        }
                        className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-700 transition hover:border-ember-600 hover:text-ember-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {removing === "banner" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* LOGO */}
                <div className="mt-8 border-t border-graphite-200 pt-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative shrink-0">
                      <div className="grid h-28 w-28 overflow-hidden rounded-card border border-graphite-200 bg-cloud-100">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Store logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid place-items-center text-graphite-400">
                            <Store className="h-9 w-9" />
                          </div>
                        )}

                        {uploading === "logo" && (
                          <div className="absolute inset-0 grid place-items-center rounded-card bg-graphite-950/60">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-graphite-900">
                        Store logo
                      </h3>

                      <p className="mt-1 max-w-md text-xs leading-5 text-graphite-600">
                        Use a square logo that clearly represents your
                        store. Recommended size: 512 × 512px.
                      </p>

                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) =>
                          handleUpload(event, "logo")
                        }
                        className="hidden"
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={
                            uploading === "logo" ||
                            removing === "logo"
                          }
                          className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-graphite-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {uploading === "logo" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}

                          {logoPreview ? "Change logo" : "Upload logo"}
                        </button>

                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => handleRemove("logo")}
                            disabled={
                              uploading === "logo" ||
                              removing === "logo"
                            }
                            className="inline-flex items-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-700 transition hover:border-ember-600 hover:text-ember-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {removing === "logo" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}

                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STORE INFORMATION */}
            <section className="rounded-card border border-graphite-200 bg-white shadow-card">
              <div className="border-b border-graphite-200 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700">
                    <Store className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="font-semibold text-graphite-900">
                      Store information
                    </h2>

                    <p className="text-sm text-graphite-600">
                      Information customers will see on your store.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="storeName"
                    className="mb-1.5 block text-sm font-semibold text-graphite-900"
                  >
                    Store name
                  </label>

                  <input
                    id="storeName"
                    value={storeName}
                    onChange={(event) =>
                      setStoreName(event.target.value)
                    }
                    required
                    maxLength={100}
                    className="w-full rounded-card border border-graphite-200 bg-white px-3.5 py-3 text-sm text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                    placeholder="Your store name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="storeSlug"
                    className="mb-1.5 block text-sm font-semibold text-graphite-900"
                  >
                    Store URL
                  </label>

                  <div className="flex overflow-hidden rounded-card border border-graphite-200 focus-within:border-ember-600">
                    <span className="flex items-center border-r border-graphite-200 bg-cloud-100 px-3 text-sm text-graphite-500">
                      /store/
                    </span>

                    <input
                      id="storeSlug"
                      value={storeSlug}
                      onChange={(event) =>
                        setStoreSlug(
                          event.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      required
                      maxLength={80}
                      className="min-w-0 flex-1 bg-white px-3.5 py-3 text-sm text-graphite-900 outline-none"
                      placeholder="your-store"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-graphite-500">
                    Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1.5 block text-sm font-semibold text-graphite-900"
                  >
                    Store description
                  </label>

                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={500}
                    rows={5}
                    className="w-full resize-y rounded-card border border-graphite-200 bg-white px-3.5 py-3 text-sm leading-6 text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                    placeholder="Tell customers what your store sells and what makes it special..."
                  />

                  <div className="mt-1.5 flex justify-end text-xs text-graphite-500">
                    {bio.length}/500
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-graphite-900"
                    >
                      <MapPin className="h-4 w-4 text-graphite-500" />
                      Location
                    </label>

                    <input
                      id="location"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      maxLength={150}
                      className="w-full rounded-card border border-graphite-200 bg-white px-3.5 py-3 text-sm text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                      placeholder="Lagos, Nigeria"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="whatsappNumber"
                      className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-graphite-900"
                    >
                      <MessageCircle className="h-4 w-4 text-graphite-500" />
                      WhatsApp number
                    </label>

                    <input
                      id="whatsappNumber"
                      value={whatsappNumber}
                      onChange={(event) =>
                        setWhatsappNumber(event.target.value)
                      }
                      maxLength={30}
                      type="tel"
                      className="w-full rounded-card border border-graphite-200 bg-white px-3.5 py-3 text-sm text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SAVE */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/vendor/dashboard"
                className="inline-flex justify-center rounded-card border border-graphite-200 px-5 py-3 text-sm font-semibold text-graphite-700 transition hover:border-graphite-400 hover:text-graphite-900"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-card border border-graphite-200 bg-white shadow-card">
              <div className="border-b border-graphite-200 px-5 py-4">
                <h2 className="font-semibold text-graphite-900">
                  Store preview
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  A quick look at your storefront identity.
                </p>
              </div>

              <div className="p-5">
                <div className="overflow-hidden rounded-card border border-graphite-200 bg-cloud-50">
                  <div className="relative h-32 overflow-hidden bg-cloud-100">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <ImageIcon className="h-8 w-8 text-graphite-300" />
                      </div>
                    )}

                    <div className="absolute -bottom-7 left-4 grid h-16 w-16 overflow-hidden rounded-card border-4 border-white bg-white shadow-card">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid place-items-center bg-cloud-100 text-graphite-400">
                          <Store className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-5 pt-10">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-graphite-900">
                        {storeName || "Your store"}
                      </h3>

                      {store?.verified && (
                        <span
                          title="Verified store"
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verified-600 text-white"
                        >
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-graphite-500">
                      /store/{storeSlug || "your-store"}
                    </p>

                    {location && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-graphite-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}

                    {bio && (
                      <p className="mt-3 line-clamp-3 text-sm leading-5 text-graphite-600">
                        {bio}
                      </p>
                    )}

                    {whatsappNumber && (
                      <div className="mt-4 flex items-center gap-2 rounded-card bg-cloud-100 px-3 py-2.5 text-xs font-medium text-graphite-700">
                        <MessageCircle className="h-4 w-4 text-verified-600" />
                        WhatsApp available
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-graphite-500">
                  Your storefront preview updates as you edit the
                  information above. Save your changes when you're
                  finished.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
