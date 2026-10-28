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
const SOUND_BRANDS = ["JBL", "Sony", "Oraimo", "Anker", "Soundcore", "Bose", "Marshall", "Harman Kardon", "LG", "Samsung", "Xiaomi", "Philips", "Hisense", "Audio-Technica", "Beats", "Sennheiser", "Ultimate Ears", "Tronsmart", "Other"];

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
  const isPhoneAccessory = ["phone case", "phone pouch", "phone accessories", "charger", "charging cable", "wireless charger", "power bank", "screen protector", "phone mount", "phone stand", "selfie stick", "phone grip", "stylus", "earphone", "earbud", "bluetooth headset", "memory card", "sim accessory"].some((term) => category.includes(term)) || ["pouch", "charger", "charging cable", "power bank", "screen protector", "phone case", "phone stand", "phone mount", "earbuds", "earphones", "stylus"].some((term) => product.includes(term));
  const isPouch = category.includes("pouch") || category.includes("sleeve") || product.includes("pouch") || product.includes("sleeve");
  const isCharger = category.includes("charger") || product.includes("charger") || product.includes("power adapter");
  const isCable = category.includes("cable") || product.includes("charging cable") || product.includes("usb cable");
  const isPowerBank = category.includes("power bank") || product.includes("power bank");
  const isPhone = !isPhoneAccessory && (category.includes("phone") || category.includes("tablet") || category === "iphone" || category === "samsung");
  const isGaming = category.includes("gaming");
  const fashionTerms = ["fashion", "clothing", "apparel", "garment", "shirt", "dress", "trouser", "jeans", "skirt", "coat", "jacket", "shoe", "footwear", "sneaker", "boot", "sandal", "bag", "handbag", "purse", "ring", "jewell", "jewel", "jewelry", "necklace", "pendant", "bracelet", "bangle", "earring", "watch", "sunglass", "eyewear", "belt", "hat", "cap", "scarf", "lingerie", "underwear", "sportswear", "traditional", "cultural wear"];
  const hasFashionCategory = fashionTerms.some((term) => category.includes(term));
  const isGenericCategory = !category || ["other", "uncategorized", "general"].some((term) => category.includes(term));
  const isFashion = hasFashionCategory || (isGenericCategory && fashionTerms.some((term) => product.includes(term)));
  const isJewellery = ["ring", "jewell", "jewel", "necklace", "pendant", "bracelet", "bangle", "earring", "watch"].some((term) => category.includes(term) || product.includes(term));
  const isRing = category.includes("ring") || product.includes("ring");
  const isNecklace = category.includes("necklace") || category.includes("pendant") || product.includes("necklace") || product.includes("pendant");
  const isBracelet = category.includes("bracelet") || category.includes("bangle") || product.includes("bracelet") || product.includes("bangle");
  const isEarring = category.includes("earring") || product.includes("earring");
  const isWatch = category.includes("watch") || product.includes("watch");
  const isFootwear = ["shoe", "footwear", "sneaker", "boot", "sandal", "slipper"].some((term) => category.includes(term) || product.includes(term));
  const isBag = ["bag", "handbag", "purse", "backpack", "wallet"].some((term) => category.includes(term) || product.includes(term));
  const isBeauty = category.includes("beauty");
  const isHome = category.includes("home") || category.includes("living");
  const isVehicle = category.includes("vehicle") || category.includes("automotive");
  const isSports = category.includes("sport");
  const isSound = category === "sound" || category.includes("audio") || category.includes("speaker") || category.includes("sound system");
  const set = (key: string, value: string) => {
    const next = { ...specifications };
    if (value.trim()) next[key] = value.trim(); else delete next[key];
    onChange(next);
  };

  const computerType = specifications.productType || (product.includes("laptop") ? "Laptop" : "");
  const phoneType = specifications.productType || (product.includes("tablet") ? "Tablet" : product.includes("phone") || product.includes("iphone") || product.includes("galaxy") ? "Phone" : "");

  const googleFields = <div className="mb-5 rounded-[10px] border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-graphite-900 dark:text-white">Product identification</h3>
      <p className="mt-1 text-xs leading-5 text-graphite-500 dark:text-graphite-400">Add official product identifiers when the manufacturer provides them. TTFL uses these automatically for search and shopping.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="GTIN / Barcode" value={specifications.gtin} onChange={(value) => set("gtin", value)} hint="UPC, EAN, ISBN or another official GTIN. Do not guess." />
      <Field label="MPN / Manufacturer Part Number" value={specifications.mpn} onChange={(value) => set("mpn", value)} hint="Use the manufacturer's exact part number when available." />
      </div>
  </div>;

  return <section className="rounded-card border border-graphite-200 p-4 dark:border-graphite-700">
    {googleFields}

    <div className="mb-4"><h2 className="text-sm font-semibold text-graphite-900 dark:text-white">Product specifications</h2><p className="mt-1 text-xs leading-5 text-graphite-500 dark:text-graphite-400">Add the details customers need. TTFL automatically converts relevant information such as category, brand, size, colour, material and variants into search-friendly product data.</p></div>

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

    {isPhoneAccessory && <div className="flex flex-col gap-3">
      <p className="text-xs leading-5 text-graphite-500 dark:text-graphite-400">Add compatibility and technical details so customers can find the right accessory through store search and product search engines.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label="Accessory type" value={specifications.accessoryType} options={["Phone pouch", "Phone case / cover", "Charger / power adapter", "Charging cable", "Wireless charger", "Power bank", "Screen protector", "Phone mount / stand", "Selfie stick / tripod", "Phone grip / ring holder", "Stylus pen", "Earphones / earbuds", "Bluetooth headset", "Memory card", "SIM accessory", "Other"]} onChange={(value) => set("accessoryType", value)} />
        <Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} />
        <Field label="Compatible device / model" value={specifications.compatibleDevice} onChange={(value) => set("compatibleDevice", value)} hint="e.g. iPhone 15 Pro, Samsung Galaxy A55, USB-C devices" />
        {isPouch ? <><SelectField label="Pouch style" value={specifications.pouchStyle} options={["Sleeve", "Wallet pouch", "Crossbody phone pouch", "Belt pouch", "Waterproof pouch", "Drawstring pouch", "Universal pouch", "Other"]} onChange={(value) => set("pouchStyle", value)} /><SelectField label="Closure" value={specifications.closure} options={["Zip", "Magnetic", "Snap button", "Velcro", "Drawstring", "Open top", "Other"]} onChange={(value) => set("closure", value)} /><Field label="Pouch dimensions" value={specifications.dimensions} onChange={(value) => set("dimensions", value)} hint="e.g. fits phones up to 6.7 inches" /><SelectField label="Water resistance" value={specifications.waterResistance} options={["Waterproof", "Water-resistant", "Not water-resistant", "Not specified"]} onChange={(value) => set("waterResistance", value)} /></> : null}
        {isCharger ? <><SelectField label="Plug type" value={specifications.plugType} options={["UK / Type G", "EU / Type C", "US / Type A/B", "USB only", "Universal", "Other"]} onChange={(value) => set("plugType", value)} /><SelectField label="Fast-charging standard" value={specifications.fastChargingStandard} options={["USB Power Delivery (PD)", "Qualcomm Quick Charge", "Samsung Super Fast Charging", "Apple fast charge", "VOOC / SuperVOOC", "Other", "Not specified"]} onChange={(value) => set("fastChargingStandard", value)} /><Field label="Number of ports" value={specifications.portCount} onChange={(value) => set("portCount", value)} hint="e.g. 1 USB-C + 1 USB-A" /><SelectField label="Cable included" value={specifications.cableIncluded} options={["Yes", "No", "Sold separately"]} onChange={(value) => set("cableIncluded", value)} /></> : null}
        {isCable ? <><Field label="Connector ends" value={specifications.connectorEnds} onChange={(value) => set("connectorEnds", value)} hint="e.g. USB-C to USB-C, USB-A to Lightning" /><Field label="Maximum power" value={specifications.maximumPower} onChange={(value) => set("maximumPower", value)} hint="e.g. 60 W, 100 W" /></> : null}
        {isPowerBank ? <><Field label="Battery capacity" value={specifications.capacity} onChange={(value) => set("capacity", value)} hint="e.g. 10,000 mAh or 20,000 mAh" /><Field label="Output ports" value={specifications.portCount} onChange={(value) => set("portCount", value)} hint="e.g. 2 USB-A + 1 USB-C" /></> : null}
        <Field label="Connector / port" value={specifications.connector} onChange={(value) => set("connector", value)} hint="e.g. USB-C, Lightning, Micro-USB, USB-A" />
        <Field label="Charging output" value={specifications.chargingOutput} onChange={(value) => set("chargingOutput", value)} hint="e.g. 20 W, 45 W, 65 W — chargers only" />
        <Field label="Cable length" value={specifications.cableLength} onChange={(value) => set("cableLength", value)} hint="e.g. 1 m, 2 m — where applicable" />
        <SelectField label="Material" value={specifications.material} options={["Silicone", "TPU", "Leather", "Fabric", "Plastic", "Metal", "Tempered glass", "Nylon", "Mixed materials", "Other"]} onChange={(value) => set("material", value)} />
        <Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} />
        <Field label="Capacity" value={specifications.capacity} onChange={(value) => set("capacity", value)} hint="e.g. 10,000 mAh — power banks only" />
        <Field label="Features" value={specifications.keyFeatures} onChange={(value) => set("keyFeatures", value)} hint="e.g. fast charging, MagSafe compatible, shockproof" />
        <SelectField label="MagSafe / magnetic compatibility" value={specifications.magneticCompatibility} options={["MagSafe compatible", "Qi2 compatible", "Magnetic but not MagSafe certified", "Not compatible", "Not applicable", "Not specified"]} onChange={(value) => set("magneticCompatibility", value)} />
        <Field label="Warranty" value={specifications.warranty} onChange={(value) => set("warranty", value)} hint="e.g. 6 months, 1 year, no warranty" />
        <Field label="Package contents" value={specifications.packageContents} onChange={(value) => set("packageContents", value)} hint="e.g. charger only, cable included, pouch + strap" />
      </div>
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

    {isFashion && <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><SelectField label="Gender" value={specifications.gender} options={["Women", "Men", "Unisex", "Girls", "Boys", "Kids", "Baby", "Not gender-specific"]} onChange={(value) => set("gender", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} /><SelectField label="Material" value={specifications.material} options={["Gold", "14K gold", "18K gold", "22K gold", "White gold", "Rose gold", "Silver", "Sterling silver", "Platinum", "Stainless steel", "Surgical steel", "Titanium", "Tungsten", "Ceramic", "Brass", "Leather", "Cotton", "Wool", "Linen", "Silk", "Polyester", "Denim", "Nylon", "Plastic", "Wood", "Gemstone", "Mixed materials", "Other"]} onChange={(value) => set("material", value)} /></div>
      {isJewellery ? <>
        <div className="grid gap-3 sm:grid-cols-2">
          {isRing ? <><Field label="Ring size" value={specifications.ringSize ?? specifications.size} onChange={(value) => { set("ringSize", value); set("size", value); }} hint="e.g. US 7, UK N, EU 54, or adjustable" /><SelectField label="Ring sizing system" value={specifications.ringSizeSystem} options={["US / Canada", "UK / Ireland", "EU / ISO", "Japan", "Adjustable / one size", "Not specified"]} onChange={(value) => set("ringSizeSystem", value)} /><SelectField label="Adjustable ring" value={specifications.adjustable} options={["Yes", "No"]} onChange={(value) => set("adjustable", value)} /></> : null}
          {isNecklace ? <Field label="Necklace length" value={specifications.necklaceLength ?? specifications.size} onChange={(value) => { set("necklaceLength", value); set("size", value); }} hint="e.g. 40 cm, 18 in" /> : null}
          {isBracelet ? <Field label="Bracelet / bangle size" value={specifications.braceletSize ?? specifications.size} onChange={(value) => { set("braceletSize", value); set("size", value); }} hint="e.g. 18 cm, small, adjustable" /> : null}
          {isEarring ? <SelectField label="Earring style" value={specifications.earringStyle} options={["Studs", "Hoops", "Drops", "Dangles", "Huggies", "Cuffs", "Clip-on", "Other"]} onChange={(value) => set("earringStyle", value)} /> : null}
          {isWatch ? <><Field label="Watch case size" value={specifications.watchCaseSize} onChange={(value) => set("watchCaseSize", value)} hint="e.g. 38 mm, 42 mm" /><SelectField label="Watch movement" value={specifications.watchMovement} options={["Quartz", "Automatic", "Mechanical", "Digital", "Smartwatch", "Other"]} onChange={(value) => set("watchMovement", value)} /></> : null}
          <Field label="Stone / gemstone" value={specifications.gemstone} onChange={(value) => set("gemstone", value)} hint="e.g. diamond, cubic zirconia, pearl, none" />
          <Field label="Finish / plating" value={specifications.finish} onChange={(value) => set("finish", value)} hint="e.g. 18K gold-plated, polished, matte" />
          <Field label="Ring / jewellery style" value={specifications.jewelleryStyle} onChange={(value) => set("jewelleryStyle", value)} hint="e.g. wedding band, signet, engagement, stacking ring" />
          <Field label="Metal purity / stamp" value={specifications.metalPurity} onChange={(value) => set("metalPurity", value)} hint="e.g. 925 sterling silver, 18K gold; only state if verified" />
          <Field label="Occasion" value={specifications.occasion} onChange={(value) => set("occasion", value)} hint="e.g. wedding, engagement, everyday, gift" />
          <Field label="Quantity in pack" value={specifications.packQuantity} onChange={(value) => set("packQuantity", value)} />
        </div>
      </> : <>
        <div className="grid gap-3 sm:grid-cols-2">
          {isFootwear ? <><Field label="Shoe size" value={specifications.shoeSize ?? specifications.size} onChange={(value) => { set("shoeSize", value); set("size", value); }} hint="e.g. EU 39, UK 6, US 8" /><SelectField label="Width" value={specifications.width} options={["Narrow", "Regular", "Wide", "Extra wide"]} onChange={(value) => set("width", value)} /></> : null}
          {isBag ? <><Field label="Bag dimensions" value={specifications.dimensions} onChange={(value) => set("dimensions", value)} hint="e.g. 30 × 20 × 12 cm" /><Field label="Capacity" value={specifications.capacity} onChange={(value) => set("capacity", value)} hint="e.g. 20 L" /></> : null}
          {!isFootwear && !isBag ? <><SelectField label="Clothing size" value={specifications.size} options={["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "One size", "Custom / made to measure"]} onChange={(value) => set("size", value)} /><Field label="Fit" value={specifications.fit} onChange={(value) => set("fit", value)} hint="e.g. slim, regular, relaxed, oversized" /></> : null}
          <Field label="Pattern / style" value={specifications.pattern} onChange={(value) => set("pattern", value)} />
          {!isFootwear && !isBag ? <><SelectField label="Size system" value={specifications.sizeSystem} options={["International (XS–4XL)", "UK", "US", "EU", "Custom / made to measure", "Not specified"]} onChange={(value) => set("sizeSystem", value)} /><Field label="Waist / inseam" value={specifications.waistInseam} onChange={(value) => set("waistInseam", value)} hint="e.g. 32-inch waist, 30-inch inseam" /><Field label="Sleeve length / neckline" value={specifications.sleeveNeckline} onChange={(value) => set("sleeveNeckline", value)} hint="Where relevant to the garment" /><Field label="Occasion" value={specifications.occasion} onChange={(value) => set("occasion", value)} hint="e.g. casual, office, wedding, sportswear" /></> : null}
          <Field label="Care instructions" value={specifications.careInstructions} onChange={(value) => set("careInstructions", value)} />
          <Field label="Age group" value={specifications.ageGroup} onChange={(value) => set("ageGroup", value)} hint="e.g. adult, teen, child" />
        </div>
      </>}
    </div>}

    {isBeauty && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Product Type" value={specifications.productType} onChange={(value) => set("productType", value)} /><Field label="Size / Volume" value={specifications.size} onChange={(value) => set("size", value)} /><Field label="Skin / Hair Type" value={specifications.skinHairType} onChange={(value) => set("skinHairType", value)} /><Field label="Ingredients" value={specifications.ingredients} onChange={(value) => set("ingredients", value)} /><Field label="Expiry Date" value={specifications.expiryDate} onChange={(value) => set("expiryDate", value)} /></div>}

    {isHome && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Product Type" value={specifications.productType} onChange={(value) => set("productType", value)} /><Field label="Material" value={specifications.material} onChange={(value) => set("material", value)} /><Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} /><Field label="Dimensions" value={specifications.dimensions} onChange={(value) => set("dimensions", value)} /><Field label="Weight" value={specifications.weight} onChange={(value) => set("weight", value)} /></div>}

    {isVehicle && <div className="grid gap-3 sm:grid-cols-2"><Field label="Make" value={specifications.make} onChange={(value) => set("make", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /><Field label="Year" value={specifications.year} onChange={(value) => set("year", value)} /><Field label="Mileage" value={specifications.mileage} onChange={(value) => set("mileage", value)} /><SelectField label="Transmission" value={specifications.transmission} options={["Automatic", "Manual", "CVT", "Other"]} onChange={(value) => set("transmission", value)} /><SelectField label="Fuel Type" value={specifications.fuelType} options={["Petrol", "Diesel", "Hybrid", "Electric", "Other"]} onChange={(value) => set("fuelType", value)} /></div>}


    {isSound && <div className="mt-5 rounded-2xl border border-ember-200 bg-ember-50/40 p-4 dark:border-ember-900/60 dark:bg-ember-950/10"><div className="mb-4"><h3 className="text-base font-bold text-graphite-900 dark:text-white">Sound specifications</h3><p className="mt-1 text-xs leading-5 text-graphite-500 dark:text-graphite-400">Add sound and audio-specific details. These fields are saved with the product and can be used for search, SEO and shopping data.</p></div><div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Brand" value={specifications.brand} options={SOUND_BRANDS} onChange={(value) => set("brand", value)} /><Field label="Custom brand name" value={specifications.customBrand} onChange={(value) => set("customBrand", value)} hint="Optional — use this if the brand is not listed above." /></div>
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Product type" value={specifications.productType} options={["Bluetooth Speaker", "Party Speaker", "Portable Speaker", "Soundbar", "Home Theatre System", "Studio Monitor", "Subwoofer", "Headphones", "Earbuds", "Microphone", "Audio Amplifier", "Other"]} onChange={(value) => set("productType", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Connectivity" value={specifications.connectivity} options={["Bluetooth", "Bluetooth + AUX", "Bluetooth + USB", "Bluetooth + Wi-Fi", "Bluetooth + HDMI", "Bluetooth + Optical", "Wired", "Multiple / Other"]} onChange={(value) => set("connectivity", value)} /><Field label="Power output" value={specifications.powerOutput} onChange={(value) => set("powerOutput", value)} hint="e.g. 20 W, 100 W RMS" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Battery life" value={specifications.batteryLife} onChange={(value) => set("batteryLife", value)} hint="e.g. Up to 12 hours" /><Field label="Wireless range" value={specifications.wirelessRange} onChange={(value) => set("wirelessRange", value)} hint="e.g. 10 m, 30 m" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Water resistance" value={specifications.waterResistance} options={["None", "IPX4", "IPX5", "IPX6", "IPX7", "IP67", "Other"]} onChange={(value) => set("waterResistance", value)} /><SelectField label="Battery powered" value={specifications.batteryPowered} options={["Yes", "No"]} onChange={(value) => set("batteryPowered", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><SelectField label="Microphone" value={specifications.microphone} options={["Built-in", "External / Included", "No", "Other"]} onChange={(value) => set("microphone", value)} /><SelectField label="Karaoke" value={specifications.karaoke} options={["Yes", "No"]} onChange={(value) => set("karaoke", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Channels" value={specifications.channels} onChange={(value) => set("channels", value)} hint="e.g. 2.0, 2.1, 5.1" /><Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Weight" value={specifications.weight} onChange={(value) => set("weight", value)} /><Field label="Warranty" value={specifications.warranty} onChange={(value) => set("warranty", value)} /></div>
    </div></div>}

    {isSports && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Sport" value={specifications.sport} onChange={(value) => set("sport", value)} /><Field label="Size" value={specifications.size} onChange={(value) => set("size", value)} /><Field label="Material" value={specifications.material} onChange={(value) => set("material", value)} /><Field label="Gender" value={specifications.gender} onChange={(value) => set("gender", value)} /><Field label="Age Group" value={specifications.ageGroup} onChange={(value) => set("ageGroup", value)} /></div>}

    {!isComputer && !isPhone && !isPhoneAccessory && !isGaming && !isFashion && !isBeauty && !isHome && !isVehicle && !isSports && !isSound && <div className="grid gap-3 sm:grid-cols-2"><Field label="Brand" value={specifications.brand} onChange={(value) => set("brand", value)} /><Field label="Model" value={specifications.model} onChange={(value) => set("model", value)} /><Field label="Product Type" value={specifications.productType} onChange={(value) => set("productType", value)} /><Field label="Colour" value={specifications.colour} onChange={(value) => set("colour", value)} /><Field label="Size / Dimensions" value={specifications.size ?? specifications.dimensions} onChange={(value) => { set("size", value); set("dimensions", value); }} /><Field label="Material" value={specifications.material} onChange={(value) => set("material", value)} /><SelectField label="Gender" value={specifications.gender} options={["Women", "Men", "Unisex", "Girls", "Boys", "Kids", "Baby", "Not gender-specific"]} onChange={(value) => set("gender", value)} /><Field label="Key Features" value={specifications.keyFeatures} onChange={(value) => set("keyFeatures", value)} /></div>}
  </section>;
}
