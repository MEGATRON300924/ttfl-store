"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Loader2,
  Save,
  Store,
  Upload,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api-client";
import type { ApiUser } from "@/lib/api-types";

/*
 * Change these two paths ONLY if your backend uses different routes.
 *
 * The actual Cloudinary credentials must stay on the backend.
 */
const STORE_UPDATE_ENDPOINT = "/api/vendor/store";
const IMAGE_UPLOAD_ENDPOINT = "/api/vendor/upload";

type StoreForm = {
  storeName: string;
  description: string;
  location: string;
  phone: string;
  whatsapp: string;
  website: string;
  logoUrl: string;
  bannerUrl: string;
};

type VendorProfile = NonNullable<ApiUser["vendorProfile"]>;

export default function VendorStoreSettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();

  const vendor = user?.vendorProfile as VendorProfile | undefined;

  const [form, setForm] = useState<StoreForm>({
    storeName: "",
    description: "",
    location: "",
    phone: "",
    whatsapp: "",
    website: "",
    logoUrl: "",
    bannerUrl: "",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * Load the vendor information already available in the auth user.
   *
   * This keeps the page fast and avoids making another request
   * when the information is already present in /api/auth/me.
   */
  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "VENDOR") {
      setPageLoading(false);
      return;
    }

    if (vendor) {
      setForm({
        storeName: vendor.storeName ?? "",
        description: vendor.description ?? "",
        location: vendor.location ?? "",
        phone: vendor.phone ?? "",
        whatsapp: vendor.whatsapp ?? "",
        website: vendor.website ?? "",
        logoUrl: vendor.logoUrl ?? "",
        bannerUrl: vendor.bannerUrl ?? "",
      });
    }

    setPageLoading(false);
  }, [authLoading, user, vendor]);

  const updateField = (
    field: keyof StoreForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setError("");
  };

  const uploadImage = async (
    event: ChangeEvent<HTMLInputElement>,
    type: "logo" | "banner"
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(type);

      const body = new FormData();
      body.append("file", file);
      body.append("type", type);

      /*
       * Use fetch directly because FormData must not be sent
       * with a JSON Content-Type header.
       *
       * credentials: include keeps the vendor session cookie.
       */
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${apiUrl}${IMAGE_UPLOAD_ENDPOINT}`,
        {
          method: "POST",
          credentials: "include",
          body,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Image upload failed."
        );
      }

      /*
       * Support several common backend response formats.
       */
      const imageUrl =
        data?.url ??
        data?.imageUrl ??
        data?.secure_url ??
        data?.data?.url ??
        data?.data?.imageUrl;

      if (!imageUrl) {
        throw new Error(
          "The image uploaded, but the server did not return an image URL."
        );
      }

      updateField(
        type === "logo" ? "logoUrl" : "bannerUrl",
        imageUrl
      );

      setMessage(
        type === "logo"
          ? "Logo uploaded successfully."
          : "Store banner uploaded successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  };

  const saveStore = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.storeName.trim()) {
      setError("Please enter a store name.");
      return;
    }

    try {
      setSaving(true);

      await api.put(STORE_UPDATE_ENDPOINT, {
        storeName: form.storeName.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        website: form.website.trim(),
        logoUrl: form.logoUrl.trim(),
        bannerUrl: form.bannerUrl.trim(),
      });

      /*
       * Refresh auth state so the updated vendor profile
       * is immediately available throughout the dashboard.
       */
      await refresh();

      setMessage("Your store has been updated successfully.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message ||
            "Unable to update your store."
        );
      } else {
        setError("Unable to update your store. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="shell py-16 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-ember-600" />
        <p className="mt-3 text-sm text-graphite-600">
          Loading your store...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "VENDOR") {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">
          Vendor access only
        </h1>

        <p className="mt-2 text-sm text-graphite-600">
          Please log in with a vendor account.
        </p>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-graphite-600 hover:text-ember-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-card bg-cloud-100 text-graphite-700">
              <Store className="h-5 w-5" />
            </span>

            <div>
              <h1 className="text-xl font-bold text-graphite-900">
                Store settings
              </h1>

              <p className="text-sm text-graphite-600">
                Manage how your store appears to customers.
              </p>
            </div>
          </div>
        </div>

        {vendor?.storeSlug && (
          <Link
            href={`/store/${vendor.storeSlug}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:border-ember-600 hover:text-ember-600"
          >
            View store
          </Link>
        )}
      </div>

      {/* Alerts */}
      {message && (
        <div className="mt-6 rounded-card border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={saveStore}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* Main settings */}
        <div className="space-y-6">
          {/* Basic information */}
          <section className="rounded-card border border-graphite-200 bg-white p-6">
            <h2 className="text-base font-bold text-graphite-900">
              Store information
            </h2>

            <p className="mt-1 text-sm text-graphite-600">
              Tell customers about your business.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Store name
                </label>

                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) =>
                    updateField("storeName", e.target.value)
                  }
                  placeholder="My Store"
                  maxLength={100}
                  className="mt-2 w-full rounded-card border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-ember-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Store description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Tell customers what your store sells..."
                  rows={5}
                  maxLength={1000}
                  className="mt-2 w-full resize-none rounded-card border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-ember-600"
                />

                <p className="mt-1 text-xs text-graphite-500">
                  {form.description.length}/1000
                </p>
              </div>
            </div>
          </section>

          {/* Contact information */}
          <section className="rounded-card border border-graphite-200 bg-white p-6">
            <h2 className="text-base font-bold text-graphite-900">
              Contact information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Location
                </label>

                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    updateField("location", e.target.value)
                  }
                  placeholder="Abuja, Nigeria"
                  className="mt-2 w-full rounded-card border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-ember-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Phone number
                </label>

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value)
                  }
                  placeholder="+234..."
                  className="mt-2 w-full rounded-card border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-ember-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  WhatsApp number
                </label>

                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) =>
                    updateField("whatsapp", e.target.value)
                  }
                  placeholder="+234..."
                  className="mt-2 w-full rounded-card border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-ember-600"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Website
                </label>

                <input
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    updateField("website", e.target.value)
                  }
                  placeholder="https://example.com"
                  className="mt-2 w-full rounded-card border border-graphite-200 px-4 py-3 text-sm outline-none focus:border-ember-600"
                />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-card border border-graphite-200 bg-white p-6">
            <h2 className="text-base font-bold text-graphite-900">
              Store branding
            </h2>

            <p className="mt-1 text-sm text-graphite-600">
              Upload the images customers will see on your storefront.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {/* Logo */}
              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Store logo
                </label>

                <div className="mt-2 overflow-hidden rounded-card border border-graphite-200">
                  <div className="flex h-40 items-center justify-center bg-cloud-50 p-6">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Store logo preview"
                        className="h-28 w-28 rounded-card object-contain"
                      />
                    ) : (
                      <div className="text-center text-graphite-500">
                        <ImageIcon className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-xs">
                          No logo uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-graphite-200 px-4 py-3 text-sm font-semibold text-graphite-800 hover:bg-cloud-50">
                    {uploading === "logo" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Upload logo
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(e) =>
                        uploadImage(e, "logo")
                      }
                    />
                  </label>
                </div>

                <p className="mt-2 text-xs text-graphite-500">
                  PNG, JPG, or WebP. Maximum 5MB.
                </p>
              </div>

              {/* Banner */}
              <div>
                <label className="text-sm font-semibold text-graphite-900">
                  Store banner
                </label>

                <div className="mt-2 overflow-hidden rounded-card border border-graphite-200">
                  <div className="flex h-40 items-center justify-center bg-cloud-50">
                    {form.bannerUrl ? (
                      <img
                        src={form.bannerUrl}
                        alt="Store banner preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-graphite-500">
                        <ImageIcon className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-xs">
                          No banner uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-center justify-center gap-2 border-t border-graphite-200 px-4 py-3 text-sm font-semibold text-graphite-800 hover:bg-cloud-50">
                    {uploading === "banner" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload banner
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploading !== null}
                      onChange={(e) =>
                        uploadImage(e, "banner")
                      }
                    />
                  </label>
                </div>

                <p className="mt-2 text-xs text-graphite-500">
                  A wide image works best for your storefront banner.
                </p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || uploading !== null}
              className="inline-flex items-center gap-2 rounded-card bg-ember-600 px-5 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save store
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <aside className="h-fit rounded-card border border-graphite-200 bg-white p-5 lg:sticky lg:top-6">
          <h2 className="text-base font-bold text-graphite-900">
            Store preview
          </h2>

          <div className="mt-4 overflow-hidden rounded-card border border-graphite-200">
            <div className="relative h-32 bg-cloud-100">
              {form.bannerUrl && (
                <img
                  src={form.bannerUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="relative px-5 pb-5">
              <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-card border-4 border-white bg-cloud-100">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Store className="h-7 w-7 text-graphite-500" />
                )}
              </div>

              <h3 className="mt-3 font-bold text-graphite-900">
                {form.storeName || "Your Store"}
              </h3>

              <p className="mt-2 line-clamp-4 text-sm text-graphite-600">
                {form.description ||
                  "Your store description will appear here."}
              </p>

              {form.location && (
       
