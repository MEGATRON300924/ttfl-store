"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
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

const STORE_UPDATE_ENDPOINT = "/api/vendors/me/store";
const IMAGE_UPLOAD_ENDPOINT = "/api/uploads/store-branding";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function VendorStoreSettingsPage() {
  const { user, loading } = useAuth();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<StoreForm>({
    storeName: "",
    storeSlug: "",
    bio: "",
    location: "",
    whatsappNumber: "",
    logoUrl: "",
    bannerUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadType | null>(null);
  const [removing, setRemoving] = useState<UploadType | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const vendor = user?.vendorProfile;

  useEffect(() => {
    if (!vendor) return;

    setForm((current) => ({
      ...current,
      storeName: vendor.storeName ?? "",
      storeSlug: vendor.storeSlug ?? "",
      bio: vendor.bio ?? "",
      location: vendor.location ?? "",
      whatsappNumber: vendor.whatsappNumber ?? "",
    }));
  }, [vendor]);

  function updateField(field: keyof StoreForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleStoreNameChange(value: string) {
    setForm((current) => {
      const oldGeneratedSlug = normalizeSlug(current.storeName);

      const shouldUpdateSlug =
        !current.storeSlug || current.storeSlug === oldGeneratedSlug;

      return {
        ...current,
        storeName: value,
        storeSlug: shouldUpdateSlug
          ? normalizeSlug(value)
          : current.storeSlug,
      };
    });
  }

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSuccessMessage("");
    setErrorMessage("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(
        "Please upload a JPG, PNG, WebP, or AVIF image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Image must be smaller than 5MB.");

      event.target.value = "";
      return;
    }

    setUploading(type);

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("type", type);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured."
        );
      }

      const response = await fetch(
        `${apiUrl}${IMAGE_UPLOAD_ENDPOINT}`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Image upload failed."
        );
      }

      const uploadedUrl =
        data?.url ||
        data?.imageUrl ||
        data?.secure_url ||
        data?.data?.url ||
        data?.data?.imageUrl ||
        data?.data?.secure_url ||
        data?.vendorProfile?.[
          type === "logo" ? "logoUrl" : "bannerUrl"
        ];

      if (!uploadedUrl) {
        throw new Error(
          "The image uploaded, but the server did not return an image URL."
        );
      }

      setForm((current) => ({
        ...current,
        [type === "logo" ? "logoUrl" : "bannerUrl"]:
          uploadedUrl,
      }));

      setSuccessMessage(
        type === "logo"
          ? "Store logo uploaded successfully."
          : "Store banner uploaded successfully."
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload image."
      );
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  }

  async function removeImage(type: UploadType) {
    setSuccessMessage("");
    setErrorMessage("");
    setRemoving(type);

    try {
      await api.delete(
        `${IMAGE_UPLOAD_ENDPOINT}?type=${type}`
      );

      setForm((current) => ({
        ...current,
        [type === "logo" ? "logoUrl" : "bannerUrl"]: "",
      }));

      setSuccessMessage(
        type === "logo"
          ? "Store logo removed."
          : "Store banner removed."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to remove image."
        );
      }
    } finally {
      setRemoving(null);
    }
  }

  async function saveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const storeName = form.storeName.trim();
    const storeSlug = normalizeSlug(form.storeSlug);

    if (!storeName) {
      setErrorMessage("Store name is required.");
      return;
    }

    if (!storeSlug) {
      setErrorMessage("Store URL slug is required.");
      return;
    }

    setSaving(true);

    try {
      await api.patch(STORE_UPDATE_ENDPOINT, {
        storeName,
        storeSlug,
        bio: form.bio.trim(),
        location: form.location.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
      });

      setForm((current) => ({
        ...current,
        storeName,
        storeSlug,
      }));

      setSuccessMessage(
        "Your store settings have been saved successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to save your store settings."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    if (!vendor) return;

    setForm((current) => ({
      ...current,
      storeName: vendor.storeName ?? "",
      storeSlug: vendor.storeSlug ?? "",
      bio: vendor.bio ?? "",
      location: vendor.location ?? "",
      whatsappNumber: vendor.whatsappNumber ?? "",
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  if (loading) {
    return (
      <div className="shell py-16">
        <div className="flex items-center justify-center gap-2 text-sm text-graphite-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading store settings...
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

        <p className="mt-2 text-sm text-graphite-600">
          Log in with a vendor account to manage your store.
        </p>

        <Link
          href="/sell"
          className="mt-5 inline-flex rounded-card bg-ember-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ember-700"
        >
          Apply to sell
        </Link>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="text-lg font-bold text-graphite-900">
          Store profile not found
        </h1>

        <p className="mt-2 text-sm text-graphite-600">
          Your vendor account does not have a store profile yet.
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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-graphite-600 hover:text-graphite-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-graphite-900">
              Store settings
            </h1>

            <p className="mt-1 text-sm text-graphite-600">
              Manage your store information, contact details, and
              branding.
            </p>
          </div>
        </div>

        {vendor.storeSlug && (
          <Link
            href={`/store/${vendor.storeSlug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 rounded-card border border-graphite-200 px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:border-ember-600 hover:text-ember-600"
          >
            <Store className="h-4 w-4" />
            View store
          </Link>
        )}
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-verified-100 bg-verified-100 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-verified-600" />

          <p className="text-sm font-medium text-verified-700">
            {successMessage}
          </p>

          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="ml-auto text-verified-700 hover:text-verified-900"
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-card border border-ember-100 bg-ember-100 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ember-700">
              Something went wrong
            </p>

            <p className="mt-0.5 text-sm text-ember-700">
              {errorMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-ember-700 hover:text-ember-900"
            aria-label="Dismiss error message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={saveStore}>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {/* Store information */}
            <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="font-bold text-graphite-900">
                  Store information
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  This information appears on your public storefront.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="storeName"
                    className="mb-1.5 block text-sm font-semibold text-graphite-800"
                  >
                    Store name
                  </label>

                  <input
                    id="storeName"
                    type="text"
                    value={form.storeName}
                    onChange={(event) =>
                      handleStoreNameChange(event.target.value)
                    }
                    placeholder="Your store name"
                    maxLength={100}
                    className="w-full rounded-card border border-graphite-200 bg-white px-3.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-400 focus:border-ember-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="storeSlug"
                    className="mb-1.5 block text-sm font-semibold text-graphite-800"
                  >
                    Store URL
                  </label>

                  <div className="flex overflow-hidden rounded-card border border-graphite-200 bg-white focus-within:border-ember-600">
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
                      placeholder="your-store"
                      maxLength={80}
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-400"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-graphite-500">
                    Use lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="mb-1.5 block text-sm font-semibold text-graphite-800"
                  >
                    Store description
                  </label>

                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(event) =>
                      updateField("bio", event.target.value)
                    }
                    placeholder="Tell customers what your store sells..."
                    maxLength={500}
                    rows={5}
                    className="w-full resize-none rounded-card border border-graphite-200 bg-white px-3.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-400 focus:border-ember-600"
                  />

                  <p className="mt-1.5 text-right text-xs text-graphite-500">
                    {form.bio.length}/500
                  </p>
                </div>
              </div>
            </section>

            {/* Contact information */}
            <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="font-bold text-graphite-900">
                  Contact information
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  Give customers useful ways to contact your store.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="location"
                    className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-graphite-800"
                  >
                    <MapPin className="h-4 w-4 text-graphite-500" />
                    Location
                  </label>

                  <input
                    id="location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    placeholder="Lagos, Nigeria"
                    maxLength={150}
                    className="w-full rounded-card border border-graphite-200 bg-white px-3.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-400 focus:border-ember-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsappNumber"
                    className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-graphite-800"
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
                    className="w-full rounded-card border border-graphite-200 bg-white px-3.5 py-2.5 text-sm text-graphite-900 outline-none placeholder:text-graphite-400 focus:border-ember-600"
                  />

                  <p className="mt-1.5 text-xs text-graphite-500">
                    Customers can use this to contact your store.
                  </p>
                </div>
              </div>
            </section>

            {/* Branding */}
            <section className="rounded-card border border-graphite-200 bg-white p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="font-bold text-graphite-900">
                  Store branding
                </h2>

                <p className="mt-1 text-sm text-graphite-600">
                  Upload a logo and banner to make your storefront
                  recognizable.
                </p>
              </div>

              <div className="space-y-7">
                {/* Banner */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-graphite-800">
                        Store banner
                      </p>

                      <p className="mt-0.5 text-xs text-graphite-500">
                        Recommended size: 1600 × 600
                      </p>
                    </div>

                    {form.bannerUrl && (
                      <button
                        type="button"
                        onClick={() => removeImage("banner")}
                        disabled={removing === "banner"}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ember-600 hover:text-ember-700 disabled:opacity-50"
                      >
                        {removing === "banner" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-card border border-graphite-200 bg-cloud-100">
                    {form.bannerUrl ? (
                      <div className="relative aspect-[16/6]">
                        <img
                          src={form.bannerUrl}
                          alt="Store banner"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          bannerInputRef.current?.click()
                        }
                        disabled={uploading === "banner"}
                        className="flex aspect-[16/6] w-full flex-col items-center justify-center gap-2 text-graphite-500 hover:bg-cloud-50 hover:text-graphite-700 disabled:opacity-50"
                      >
                        {uploading === "banner" ? (
                          <Loader2 className="h-7 w-7 animate-spin" />
                        ) : (
                          <Upload className="h-7 w-7" />
                        )}

                        <span className="text-sm font-semibold">
                          {uploading === "banner"
                            ? "Uploading..."
                            : "Upload banner"}
                        </span>

                        <span className="text-xs">
                          JPG, PNG, WebP or AVIF · Max 5MB
                        </span>
                      </button>
                    )}
                  </div>

                  {form.bannerUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        bannerInputRef.current?.click()
                      }
                      disabled={uploading === "banner"}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-graphite-600 hover:text-ember-600 disabled:opacity-50"
                    >
                      {uploading === "banner" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      Replace banner
                    </button>
                  )}

                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) =>
                      uploadImage(event, "banner")
                    }
                    className="hidden"
                  />
                </div>

                {/* Logo */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-graphite-800">
                        Store logo
                      </p>

                      <p className="mt-0.5 text-xs text-graphite-500">
                        Recommended size: 512 × 512
                      </p>
                    </div>

                    {form.logoUrl && (
                      <button
                        type="button"
                        onClick={() => removeImage("logo")}
                        disabled={removing === "logo"}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ember-600 hover:text-ember-700 disabled:opacity-50"
                      >
                        {removing === "logo" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-card border border-graphite-200 bg-cloud-100">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt="Store logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-graphite-400" />
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          logoInputRef.current?.click()
                        }
                        disabled={uploading === "logo"}
                        className="inline-flex items-center gap-2 rounded-card border border-graphite-200 bg-white px-4 py-2.5 text-sm font-semibold text-graphite-800 hover:border-ember-600 hover:text-ember-600 disabled:opacity-50"
                      >
                        {uploading === "logo" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}

                        {uploading === "logo"
                          ? "Uploading..."
                          : form.logoUrl
                            ? "Replace logo"
                            : "Upload logo"}
                      </button>

                      <p className="mt-2 max-w-xs text-xs leading-5 text-graphite-500">
                        Use a square image with your store logo.
                        JPG, PNG, WebP or AVIF, up to 5MB.
                      </p>
                    </div>
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) =>
                      uploadImage(event, "logo")
                    }
                    className="hidden"
                  />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-card border border-graphite-200 bg-white px-5 py-2.5 text-sm font-semibold text-graphite-700 hover:border-graphite-400 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-card bg-ember-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* Live preview */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-card border border-graphite-200 bg-white">
              <div className="border-b border-graphite-200 px-5 py-4">
                <h2 className="font-bold text-graphite-900">
                  Store preview
                </h2>

                <p className="mt-1 text-xs text-graphite-500">
                  A quick preview of your storefront branding.
                </p>
              </div>

              <div>
                <div className="relative aspect-[16/6] overflow-hidden bg-cloud-100">
                  {form.bannerUrl ? (
                    <img
                      src={form.bannerUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-graphite-300" />
                    </div>
                  )}
                </div>

                <div className="px-5 pb-5">
                  <div className="-mt-10">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-card border-4 border-white bg-cloud-100 shadow-card">
                      {form.logoUrl ? (
                        <img
                          src={form.logoUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-7 w-7 text-graphite-400" />
                      )}
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-graphite-900">
                    {form.storeName || "Your store name"}
                  </h3>

                  <p className="mt-1 text-xs text-graphite-500">
                    /store/
                    {form.storeSlug || "your-store"}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-graphite-600">
                    {form.bio ||
                      "Your store description will appear here."}
                  </p>

                  {(form.location || form.whatsappNumber) && (
                    <div className="mt-5 space-y-2 border-t border-graphite-100 pt-4">
                      {form.location && (
                        <div className="flex items-center gap-2 text-xs text-graphite-600">
                          <MapPin className="h-3.5 w-3.5" />
                          {form.location}
                        </div>
                      )}

                      {form.whatsappNumber && (
                        <div className="flex items-center gap-2 text-xs text-graphite-600">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {form.whatsappNumber}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
