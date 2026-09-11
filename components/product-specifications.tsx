"use client";

import { TextField } from "@/components/text-field";

type Props = {
  categoryName?: string;
  productName?: string;
  specifications: Record<string, string>;
  onChange: (specifications: Record<string, string>) => void;
};

const COMPUTER_BRANDS = ["Apple", "Acer", "ASUS", "Dell", "HP", "Lenovo", "Microsoft", "MSI", "Razer", "Samsung", "Toshiba", "Huawei", "Other"];
const PHONE_BRANDS = ["Apple", "Samsung", "Google", "Xiaomi", "OnePlus", "Oppo", "Vivo", "Tecno", "Infinix", "Huawei", "Nokia", "Motorola", "Nothing", "Other"];

function normalize(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

function Field({ label, value, onChange, hint }: { label: string; value?: string; onChange: (value: string) => void; hint?: string }) {
  return <TextField label={label} value={value ?? ""} onChange={onChange} optional hint={hint} />;
}

function SelectField({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="flex flex-col gap-1 text-sm"><span className="font-medium text-graphite-700 dark:text-graphite-300">{label}<span className="ml-1 font-normal text-graphite-400">(optional)</span></span><select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="rounded-[7px] border border-graphite-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ember-600 dark:border-graphite-700 dark:bg-graphite-900 dark:text-white"><option value="">Not specified</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

export function ProductSpecifications({ categoryName, productName, specifications, onChange }: Props) {
  const category = normalize(categoryName);
  const product = normalize(productName);
  const isComputer = category.includes("computer") || category.includes("laptop") || category.includes("pc");
  const isPhone = category.includes("phone") || category.includes("tablet") || category === "iphone" || category === "samsung";
  const isGaming = category.includes("gaming");
  const isFashion = category.includes("fashion");
  const isBeauty = category.includes("beauty");
  const isHome = category.includes("home") || category.includes("living");
  const isVehicle = category.includes("vehicle") || category.includes("automotive");
  const isSports = category.includes("sport");
  const set = (key: string, value: string) => {
    const next = { ...specifications };
    if (value.trim()) next[key] = value.trim(); else delete next[key];
    onChange(next);
  };

  const computerType = specifications.productType || (product.includes("laptop") ? "Laptop" : "");
  const phoneType = specifications.productType || (product.includes("tablet") ? "Tablet" : product.includes("phone") || product.includes("iphone") || product.includes("galaxy") ? "Phone" : "");

  return <section className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700">
    <div className="mb-4"><h2 className="text-sm font-semibold text-graphite-900 dark:text-white">Product specifications</h2><p className="mt-1 text-xs leading-5 text-graphite-500 dark:text-graphite-400">These fields help customers understand the product and give TTFL Store useful structured information for search and SEO. Every field here is optional.</p></div>

    {isComputer && <div className="flex flex-col gap-3">
      <SelectField label="Product type" value={computerType} options={["Laptop", "Desktop", "Monitor", "Printer", "Computer accessory", "Other"]} onChange={(value) => set("productType", value)} />
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Brand" value={specifications.brand} options={COMPUTER_BRANDS} onChange={(value) => set("brand", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /></div>
      {normalize(computerType) === "laptop" && <>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="RAM" value={specifications.ram} onChange={(value) => set("ram", value)} hint="e.g. 8 GB, 16 GB, 32 GB" /><Field label="Storage" value={specifications.storage} onChange={(value) => set("storage", value)} hint="e.g. 256 GB, 512 GB, 1 TB" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Storage Type" value={specifications.storageType} options={["SSD", "HDD", "SSD + HDD", "NVMe SSD", "eMMC", "Other"]} onChange={(value) => set("storageType", value)} /><Field label="Processor" value={specifications.processor} onChange={(value) => set("processor", value)} hint="e.g. Intel Core i7, AMD Ryzen 7, Apple M3" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Processor Generation" value={specifications.processorGeneration} onChange={(value) => set("processorGeneration", value)} hint="e.g. 13th Gen, 14th Gen" /><Field label="Graphics Card" value={specifications.graphicsCard} onChange={(value) => set("graphicsCard", value)} hint="e.g. RTX 4060, Intel Iris Xe" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><Field label="Screen Size" value={specifications.screenSize} onChange={(value) => set("screenSize", value)} hint="e.g. 14-inch, 15.6-inch" /><Field label="Operating System" value={specifications.operatingSystem} onChange={(value) => set("operatingSystem", value)} hint="e.g. Windows 11, macOS" /></div>
        <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Condition" value={specifications.condition} options={["New", "Used", "Refurbished", "Open box"]} onChange={(value) => set("condition", value)} /><Field label="Warranty" value={specifications.warranty} onChange={(value) => set("warranty", value)} hint="e.g. 12 months, No warranty" /></div>
      </>}
    </div>}

    {isPhone && <div className="flex flex-col gap-3">
      <SelectField label="Product type" value={phoneType} options={["Phone", "Tablet", "Phone accessory", "Tablet accessory", "Other"]} onChange={(value) => set("productType", value)} />
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Brand" value={specifications.brand} options={PHONE_BRANDS} onChange={(value) => set("brand", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="RAM" value={specifications.ram} onChange={(value) => set("ram", value)} /><Field label="Storage" value={specifications.storage} onChange={(value) => set("storage", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Network" value={specifications.network} options={["3G", "4G", "5G", "Wi-Fi only", "Other"]} onChange={(value) => set("network", value)} /><SelectField label="SIM Type" value={specifications.simType} options={["Single SIM", "Dual SIM", "eSIM", "Dual SIM + eSIM", "Wi-Fi only"]} onChange={(value) => set("simType", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Screen Size" value={specifications.screenSize} onChange={(value) => set("screenSize", value)} /><Field label="Battery Capacity" value={specifications.battery} onChange={(value) => set("battery", value)} hint="e.g. 5000 mAh" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Camera" value={specifications.camera} onChange={(value) => set("camera", value)} hint="e.g. 200 MP triple camera" /><Field label="Operating System" value={specifications.operatingSystem} onChange={(value) => set("operatingSystem", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Condition" value={specifications.condition} options={["New", "Used", "Refurbished", "Open box"]} onChange={(value) => set("condition", value)} /><Field label="Warranty" value={specifications.warranty} onChange={(value) => set("warranty", value)} /></div>
    </div>}

    {isGaming && <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Platform" value={specifications.platform} options={["PC", "PlayStation 5", "PlayStation 4", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "Mobile", "Other"]} onChange={(value) => set("platform", value)} /><Field label="Brand / Developer" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Model / Edition" value={specifications.model} onChange={(value) => set("model", value)} /><Field label="Storage" value={specifications.storage} onChange={(value) => set("storage", value)} /><SelectField label="Condition" value={specifications.condition} options={["New", "Used", "Refurbished"]} onChange={(value) => set("condition", value)} /><Field label="Warranty" value={specifications.warranty} onChange={(value) => set("warranty", value)} /></div>}

    {isFashion && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Size" value={specifications.size} onChange={(value) => set("size", value)} /><Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} /><Field label="Material" value={specifications.material} onChange={(value) => set("material", value)} /><Field label="Gender" value={specifications.gender} onChange={(value) => set("gender", value)} /><Field label="Fit" value={specifications.fit} onChange={(value) => set("fit", value)} /></div>}

    {isBeauty && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Product Type" value={specifications.productType} onChange={(value) => set("productType", value)} /><Field label="Size / Volume" value={specifications.size} onChange={(value) => set("size", value)} /><Field label="Skin / Hair Type" value={specifications.skinHairType} onChange={(value) => set("skinHairType", value)} /><Field label="Ingredients" value={specifications.ingredients} onChange={(value) => set("ingredients", value)} /><Field label="Expiry Date" value={specifications.expiryDate} onChange={(value) => set("expiryDate", value)} /></div>}

    {isHome && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Product Type" value={specifications.productType} onChange={(value) => set("productType", value)} /><Field label="Material" value={specifications.material} onChange={(value) => set("material", value)} /><Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} /><Field label="Dimensions" value={specifications.dimensions} onChange={(value) => set("dimensions", value)} /><Field label="Weight" value={specifications.weight} onChange={(value) => set("weight", value)} /></div>}

    {isVehicle && <div className="grid gap-3 sm:grid-cols-2"><Field label="Make" value={specifications.make} onChange={(value) => set("make", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /><Field label="Year" value={specifications.year} onChange={(value) => set("year", value)} /><Field label="Mileage" value={specifications.mileage} onChange={(value) => set("mileage", value)} /><SelectField label="Transmission" value={specifications.transmission} options={["Automatic", "Manual", "CVT", "Other"]} onChange={(value) => set("transmission", value)} /><SelectField label="Fuel Type" value={specifications.fuelType} options={["Petrol", "Diesel", "Hybrid", "Electric", "Other"]} onChange={(value) => set("fuelType", value)} /></div>}

    {isSports && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Sport" value={specifications.sport} onChange={(value) => set("sport", value)} /><Field label="Size" value={specifications.size} onChange={(value) => set("size", value)} /><Field label="Material" value={specifications.material} onChange={(value) => set("material", value)} /><Field label="Gender" value={specifications.gender} onChange={(value) => set("gender", value)} /><Field label="Age Group" value={specifications.ageGroup} onChange={(value) => set("ageGroup", value)} /></div>}

    {!isComputer && !isPhone && !isGaming && !isFashion && !isBeauty && !isHome && !isVehicle && !isSports && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /><Field label="Product Type" value={specifications.productType} onChange={(value) => set("productType", value)} /><Field label="Key Features" value={specifications.keyFeatures} onChange={(value) => set("keyFeatures", value)} /></div>}
  </section>;
}
