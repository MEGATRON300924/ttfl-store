```tsx
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
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
import { api, ApiError } from "@/lib/api-client";

const STORE_UPDATE_ENDPOINT = "/api/vendors/me/store";
const IMAGE_UPLOAD_ENDPOINT = "/api/uploads/store-branding";

type UploadType = "logo" | "banner";

type StoreForm = {
  storeName: string;
  storeSlug: string;
  bio: string;
  location: string;
  whatsappNumber: string;
  logoUrl: string;
  bannerUrl: string;
};

export default function VendorStoreSettingsPage() {
  const { user, loading: authLoading, refresh } = useAuth();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const vendor = user?.vendorProfile;

  const [form, setForm] = useState<StoreForm>({
    storeName: "",
    storeSlug: "",
    bio: "",
    location: "",
    whatsappNumber: "",
    logoUrl: "",
    bannerUrl: "",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const [removing, setRemoving] = useState<UploadType | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== "VENDOR") {
      setPageLoading(false);
      return;
    }

    if (vendor) {
      setForm({
        storeName: vendor.storeName ?? "",
        storeSlug: vendor.storeSlug ?? "",
        bio: vendor.bio ?? "",
        location: vendor.location ?? "",
        whatsappNumber: vendor.whatsappNumber ?? "",
        logoUrl: "",
        bannerUrl: "",
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

  const normalizeSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  };

  const uploadImage = async (
    event: ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, WebP, or AVIF image."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(type);

      const body = new FormData();

      body.append("image", file);
      body.append("type", type);

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
          data?.error?.message ??
            data?.message ??
            data?.error ??
            "Image upload failed."
        );
      }

      const imageUrl =
        data?.url ??
        data?.imageUrl ??
        data?.secure_url ??
        data?.data?.url ??
        data?.data?.imageUrl ??
        data?.vendorProfile?.[
          type === "logo" ? "logoUrl" : "bannerUrl"
        ];

      if (!imageUrl) {
        throw new Error(
          "The image uploaded, but the server did not return an image URL."
        );
      }

      setForm((current) => ({
        ...current,
        [type === "logo" ? "logoUrl" : "bannerUrl"]:
          imageUrl,
      }));

      setMessage(
        type === "logo"
          ? "Store logo uploaded successfully."
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

  const removeImage = async (type: UploadType) => {
    setError("");
    setMessage("");
    setRemoving(type);

    try {
      await api.delete(
        `${IMAGE_UPLOAD_ENDPOINT}?type=${encodeURIComponent(
          type
        )}`
      );

      setForm((current) => ({
        ...current,
        [type === "logo" ? "logoUrl" : "bannerUrl"]: "",
      }));

      setMessage(
        type === "logo"
          ? "Store logo removed."
          : "Store banner removed."
      );

      await refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message || "Unable to remove the image."
        );
      } else {
        setError("Unable to remove the image.");
      }
    } finally {
      setRemoving(null);
    }
  };

  const saveStore = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.storeName.trim()) {
      setError("Please enter a store name.");
      return;
    }

    if (!form.storeSlug.trim()) {
      setError("Please enter a store URL.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(STORE_UPDATE_ENDPOINT, {
        storeName: form.storeName.trim(),
        storeSlug: normalizeSlug(form.storeSlug),
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        whatsappNumber:
          form.whatsappNumber.trim() || null,
      });

      await refresh();

      setMessage(
        "Your store settings have been saved successfully."
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.message ||
            "Unable to update your store. Please try again."
        );
      } else {
        setError(
          "Unable to update your store. Please try again."
        );
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
            className="inline-flex items-center gap-2 text-sm font-medium text-graphite-600 transition hover:text-ember-600"
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

        {form.storeSlug && (
          <Link
            href={`/store/${form.storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800 transition hover:border-ember-600 hover:text-ember-600"
          >
            View store
          </Link>
        )}
      </div>

      {/* Alerts */}
      {message && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-verified-600/20 bg-verified-100 px-4 py-3 text-sm font-medium text-verified-700">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verified-600 text-white">
            <Check className="h-3 w-3" />
          </span>

          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="ml-auto"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-ember-600/20 bg-ember-100 px-4 py-3 text-sm font-medium text-ember-700">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ember-600 text-white">
            <X className="h-3 w-3" />
          </span>

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={saveStore}
        className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* Main settings */}
        <div className="space-y-6">
          {/* Store information */}
          <section className="rounded-card border border-graphite-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700">
                <Store className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-base font-bold text-graphite-900">
                  Store information
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  Tell customers about your business.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="storeName"
                  className="text-sm font-semibold text-graphite-900"
                >
                  Store name
                </label>

                <input
                  id="storeName"
                  type="text"
                  value={form.storeName}
                  onChange={(event) =>
                    updateField(
                      "storeName",
                      event.target.value
                    )
                  }
                  placeholder="My Store"
                  maxLength={100}
                  required
                  className="mt-2 w-full rounded-card border border-graphite-200 bg-white px-4 py-3 text-sm text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                />
              </div>

              <div>
                <label
                  htmlFor="storeSlug"
                  className="text-sm font-semibold text-graphite-900"
                >
                  Store URL
                </label>

                <div className="mt-2 flex overflow-hidden rounded-card border border-graphite-200 focus-within:border-ember-600">
                  <span className="flex items-center border-r border-graphite-200 bg-cloud-100 px-3 text-sm text-graphite-500">
                    /store/
                  </span>

                  <input
                    id="storeSlug"
                    type="text"
                    value={form.storeSlug}
                    onChange={(event) =>
                      updateField(
                        "storeSlug",
                        normalizeSlug(event.target.value)
                      )
                    }
                    placeholder="my-store"
                    maxLength={80}
                    required
                    className="min-w-0 flex-1 bg-white px-4 py-3 text-sm text-graphite-900 outline-none"
                  />
                </div>

                <p className="mt-1.5 text-xs text-graphite-500">
                  Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="text-sm font-semibold text-graphite-900"
                >
                  Store description
                </label>

                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(event) =>
                    updateField(
                      "bio",
                      event.target.value
                    )
                  }
                  placeholder="Tell customers what your store sells..."
                  rows={5}
                  maxLength={500}
                  className="mt-2 w-full resize-none rounded-card border border-graphite-200 bg-white px-4 py-3 text-sm leading-6 text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                />

                <div className="mt-1 flex justify-end text-xs text-graphite-500">
                  {form.bio.length}/500
                </div>
              </div>
            </div>
          </section>

          {/* Contact information */}
          <section className="rounded-card border border-graphite-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700">
                <MessageCircle className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-base font-bold text-graphite-900">
                  Contact information
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  Give customers useful ways to reach your store.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="location"
                  className="flex items-center gap-1.5 text-sm font-semibold text-graphite-900"
                >
                  <MapPin className="h-4 w-4 text-graphite-500" />
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="Lagos, Nigeria"
                  maxLength={150}
                  className="mt-2 w-full rounded-card border border-graphite-200 bg-white px-4 py-3 text-sm text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsappNumber"
                  className="flex items-center gap-1.5 text-sm font-semibold text-graphite-900"
                >
                  <MessageCircle className="h-4 w-4 text-graphite-500" />
                  WhatsApp number
                </label>

                <input
                  id="whatsappNumber"
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(event) =>
                    updateField(
                      "whatsappNumber",
                      event.target.value
                    )
                  }
                  placeholder="+234 800 000 0000"
                  maxLength={30}
                  className="mt-2 w-full rounded-card border border-graphite-200 bg-white px-4 py-3 text-sm text-graphite-900 outline-none transition placeholder:text-graphite-400 focus:border-ember-600"
                />
              </div>
            </div>
          </section>

          {/* Store branding */}
          <section className="rounded-card border border-graphite-200 bg-white p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-card bg-cloud-100 text-graphite-700">
                <ImageIcon className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-base font-bold text-graphite-900">
                  Store branding
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  Upload the images customers will see on your storefront.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {/* Banner */}
              <div>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-graphite-900">
                      Store banner
                    </h3>

                    <p className="mt-1 text-xs text-graphite-500">
                      Recommended size: 1600 × 600px
                    </p>
                  </div>

                  <span className="hidden text-xs text-graphite-500 sm:block">
                    Max 5MB
                  </span>
                </div>

                <div className="relative aspect-[16/6] overflow-hidden rounded-card border border-dashed border-graphite-200 bg-cloud-50">
                  {form.bannerUrl ? (
                    <img
                      src={form.bannerUrl}
                      alt="Store banner preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-graphite-400 shadow-card">
                        <ImageIcon className="h-6 w-6" />
                      </span>

                      <p className="mt-3 text-sm font-medium text-graphite-700">
                        No banner uploaded
                      </p>

                      <p className="mt-1 text-xs text-graphite-500">
                        JPG, PNG, WebP or AVIF
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

                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(event) =>
                    uploadImage(event, "banner")
                  }
                  className="hidden"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      bannerInputRef.current?.click()
                    }
                    disabled={
                      uploading !== null ||
                      removing !== null
                    }
                    className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-graphite-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading === "banner" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}

                    {form.bannerUrl
                      ? "Change banner"
                      : "Upload banner"}
                  </button>

                  {form.bannerUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        removeImage("banner")
                      }
                      disabled={
                        uploading !== null ||
                        removing !== null
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

              {/* Logo */}
              <div className="border-t border-graphite-200 pt-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative shrink-0">
                    <div className="grid h-28 w-28 overflow-hidden rounded-card border border-graphite-200 bg-cloud-50">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Store logo preview"
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
                        uploadImage(event, "logo")
                      }
                      className="hidden"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          logoInputRef.current?.click()
                        }
                        disabled={
                          uploading !== null ||
                          removing !== null
                        }
                        className="inline-flex items-center gap-2 rounded-card bg-graphite-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-graphite-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading === "logo" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}

                        {form.logoUrl
                          ? "Change logo"
                          : "Upload logo"}
                      </button>

                      {form.logoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            removeImage("logo")
                          }
                          disabled={
                            uploading !== null ||
                            removing !== null
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

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/vendor/dashboard"
              className="inline-flex items-center justify-center rounded-card border border-graphite-200 px-5 py-3 text-sm font-semibold text-graphite-700 transition hover:border-graphite-400 hover:text-graphite-900"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploading !== null}
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

        {/* Preview */}
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
                  {form.bannerUrl ? (
                    <img
                      src={form.bannerUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <ImageIcon className="h-8 w-8 text-graphite-300" />
                    </div>
                  )}

                  <div className="absolute -bottom-7 left-4 grid h-16 w-16 overflow-hidden rounded-card border-4 border-white bg-white shadow-card">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
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
                      {form.storeName || "Your store"}
                    </h3>

                    {vendor?.verified && (
                      <span
                        title="Verified store"
                        className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verified-600 text-white"
                      >
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-graphite-500">
                    /store/
                    {form.storeSlug || "your-store"}
                  </p>

                  {form.location && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-graphite-600">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {form.location}
                      </span>
                    </div>
                  )}

                  {form.bio && (
                    <p className="mt-3 line-clamp-3 text-sm leading-5 text-graphite-600">
                      {form.bio}
                    </p>
                  )}

                  {form.whatsappNumber && (
                    <div className="mt-4 flex items-center gap-2 rounded-card bg-cloud-100 px-3 py-2.5 text-xs font-medium text-graphite-700">
                      <MessageCircle className="h-4 w-4 text-verified-600" />
                      WhatsApp available
                    </div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-graphite-500">
                Your preview updates as you edit. Upload your branding
                and save your store information when you're finished.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
```
