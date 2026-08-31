"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { TextField } from "@/components/text-field";
import {
  ImageUploadField,
  type UploadedImage,
} from "@/components/image-upload-field";
import type {
  ApiCategory,
  SellingMethod,
  ProductCondition,
} from "@/lib/api-types";

export type ProductFormValues = {
  name: string;
  description: string;
  categorySlug: string;
  price: string;
  previousPrice: string;
  condition: ProductCondition;
  stock: string;
  location: string;
  images: UploadedImage[];
  sellingMethod: SellingMethod;
  externalUrl: string;
  whatsappNumber: string;
};

const EMPTY: ProductFormValues = {
  name: "",
  description: "",
  categorySlug: "",
  price: "",
  previousPrice: "",
  condition: "NEW",
  stock: "1",
  location: "",
  images: [],
  sellingMethod: "CHECKOUT",
  externalUrl: "",
  whatsappNumber: "",
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Partial<ProductFormValues>;
}) {
  const router = useRouter();

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [form, setForm] = useState<ProductFormValues>({
    ...EMPTY,
    ...initial,
  });

  const [error, setError] = useState<string | null>(
    null
  );

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoadingCategories(true);

        const response =
          await api.get<{
            categories: ApiCategory[];
          }>("/api/categories");

        if (mounted) {
          setCategories(response.categories);
        }
      } catch (err) {
        console.error(
          "Failed to load categories:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load product categories. Please refresh the page and try again."
          );
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError(null);

    // Client-side validation before sending anything.
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (form.name.trim().length < 3) {
      setError(
        "Product name must be at least 3 characters."
      );
      return;
    }

    if (!form.description.trim()) {
      setError("Product description is required.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError(
        "Product description must be at least 10 characters."
      );
      return;
    }

    if (!form.categorySlug) {
      setError("Please choose a product category.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Please enter a valid product price.");
      return;
    }

    if (
      form.previousPrice &&
      Number(form.previousPrice) <= Number(form.price)
    ) {
      setError(
        "Previous price must be greater than the current price."
      );
      return;
    }

    if (Number(form.stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    if (form.images.length === 0) {
      setError(
        "Please add at least one product photo."
      );
      return;
    }

    if (
      form.sellingMethod === "EXTERNAL_LINK" &&
      !form.externalUrl.trim()
    ) {
      setError(
        "Please enter the product URL for the external link."
      );
      return;
    }

    if (
      form.sellingMethod === "EXTERNAL_LINK" &&
      form.externalUrl.trim()
    ) {
      try {
        new URL(form.externalUrl.trim());
      } catch {
        setError(
          "Please enter a valid external purchase URL."
        );
        return;
      }
    }

    if (
      form.sellingMethod === "WHATSAPP" &&
      form.whatsappNumber.trim() &&
      form.whatsappNumber.trim().length < 7
    ) {
      setError(
        "Please enter a valid WhatsApp number."
      );
      return;
    }

    setSubmitting(true);

    const images = form.images
      .map((image) => image.url)
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      name: form.name.trim(),

      description: form.description.trim(),

      categorySlug: form.categorySlug,

      price: Number(form.price),

      condition: form.condition,

      stock: Number(form.stock),

      images,

      sellingMethod: form.sellingMethod,
    };

    // Only send optional values when they actually exist.
    if (form.previousPrice.trim()) {
      payload.previousPrice =
        Number(form.previousPrice);
    }

    if (form.location.trim()) {
      payload.location = form.location.trim();
    }

    if (
      form.sellingMethod === "EXTERNAL_LINK"
    ) {
      payload.externalUrl =
        form.externalUrl.trim();
    }

    if (
      form.sellingMethod === "WHATSAPP" &&
      form.whatsappNumber.trim()
    ) {
      payload.whatsappNumber =
        form.whatsappNumber.trim();
    }

    try {
      if (productId) {
        await api.patch(
          `/api/products/${productId}`,
          payload
        );
      } else {
        await api.post(
          "/api/products",
          payload
        );
      }

      router.push(
        "/vendor/dashboard/products"
      );
    } catch (err) {
      console.error(
        "Product submission error:",
        err
      );

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong while saving the product."
        );
      }

      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <TextField
        label="Product name"
        value={form.name}
        onChange={(value) =>
          set("name", value)
        }
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-graphite-700">
          Description
        </span>

        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) =>
            set(
              "description",
              e.target.value
            )
          }
          className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-graphite-700">
          Category
        </span>

        <select
          required
          value={form.categorySlug}
          onChange={(e) =>
            set(
              "categorySlug",
              e.target.value
            )
          }
          disabled={
            loadingCategories ||
            categories.length === 0
          }
          className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 disabled:cursor-not-allowed disabled:bg-cloud-100"
        >
          <option value="" disabled>
            {loadingCategories
              ? "Loading categories..."
              : categories.length === 0
                ? "No categories available"
                : "Choose a category"}
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.slug}
            >
              {category.name}
            </option>
          ))}
        </select>

        {!loadingCategories &&
          categories.length === 0 && (
            <span className="text-xs text-ember-600">
              No categories have been created yet.
              Please contact the store administrator.
            </span>
          )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Price (₦)"
          type="number"
          value={form.price}
          onChange={(value) =>
            set("price", value)
          }
        />

        <TextField
          label="Previous price"
          type="number"
          value={form.previousPrice}
          onChange={(value) =>
            set("previousPrice", value)
          }
          optional
          hint="Only enter this if the product is discounted."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-graphite-700">
            Condition
          </span>

          <select
            value={form.condition}
            onChange={(e) =>
              set(
                "condition",
                e.target.value as ProductCondition
              )
            }
            className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600"
          >
            <option value="NEW">
              New
            </option>

            <option value="USED">
              Used
            </option>
          </select>
        </label>

        <TextField
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(value) =>
            set("stock", value)
          }
        />
      </div>

      <TextField
        label="Location"
        value={form.location}
        onChange={(value) =>
          set("location", value)
        }
        optional
        hint="Optional — e.g. Lagos, Abuja, Port Harcourt."
      />

      <ImageUploadField
        images={form.images}
        onChange={(images) =>
          set("images", images)
        }
      />

      {form.images.length === 0 && (
        <p className="text-xs text-ember-600">
          Add at least one product photo.
        </p>
      )}

      <fieldset className="rounded-card border border-graphite-200 p-4">
        <legend className="px-1 text-sm font-semibold text-graphite-900">
          How do customers buy this?
        </legend>

        <div className="mt-2 flex flex-col gap-2">
          {(
            [
              {
                value: "CHECKOUT",
                label:
                  "TTFL Store checkout — customer pays through the site",
              },
              {
                value: "EXTERNAL_LINK",
                label:
                  "External link — send them to my own website",
              },
              {
                value: "WHATSAPP",
                label:
                  "WhatsApp — chat to close the sale",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-graphite-700"
            >
              <input
                type="radio"
                name="sellingMethod"
                checked={
                  form.sellingMethod ===
                  option.value
                }
                onChange={() =>
                  set(
                    "sellingMethod",
                    option.value
                  )
                }
              />

              {option.label}
            </label>
          ))}
        </div>

        {form.sellingMethod ===
          "EXTERNAL_LINK" && (
          <div className="mt-3">
            <TextField
              label="Product URL on your website"
              value={form.externalUrl}
              onChange={(value) =>
                set(
                  "externalUrl",
                  value
                )
              }
              hint="Required only when External link is selected."
            />
          </div>
        )}

        {form.sellingMethod ===
          "WHATSAPP" && (
          <div className="mt-3">
            <TextField
              label="WhatsApp number for this product"
              value={form.whatsappNumber}
              onChange={(value) =>
                set(
                  "whatsappNumber",
                  value
                )
              }
              optional
              hint="Optional — if blank, your store's WhatsApp number will be used."
            />
          </div>
        )}
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-[7px] bg-ember-100 px-3 py-2 text-sm text-ember-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          submitting ||
          loadingCategories ||
          categories.length === 0
        }
        className="rounded-card bg-ember-600 py-3 text-sm font-semibold text-white hover:bg-ember-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? "Saving…"
          : productId
            ? "Save changes"
            : "List product"}
      </button>
    </form>
  );
}
