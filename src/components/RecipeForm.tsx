"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { VARIANTS, type RecipeVariant } from "@/lib/variants";

const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), { ssr: false });

export type RecipeFormData = {
  id?: string;
  title: string;
  description: string;
  servings: number;
  prepTime: number | "";
  imageUrl: string;
  variants: RecipeVariant[];
  categories: string[];
  ingredients: { name: string; amount: number | ""; unit: string }[];
  steps: { description: string }[];
};

const UNITS = [
  { group: "Gewicht", options: ["g", "kg", "mg"] },
  { group: "Volumen", options: ["ml", "l", "cl"] },
  { group: "Löffel", options: ["EL", "TL", "Msp."] },
  {
    group: "Stück / Sonstiges",
    options: [
      "Stück",
      "Prise",
      "Zehe",
      "Scheibe",
      "Bund",
      "Dose",
      "Glas",
      "Packung",
      "Becher",
      "Tasse",
      "Handvoll",
      "Spritzer",
    ],
  },
];

const emptyIngredient = { name: "", amount: "" as const, unit: "" };
const emptyStep = { description: "" };

export default function RecipeForm({
  initialData,
}: {
  initialData?: RecipeFormData;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [servings, setServings] = useState<number | "">(
    initialData?.servings ?? 2,
  );
  const [prepTime, setPrepTime] = useState<number | "">(
    initialData?.prepTime ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [selectedVariants, setSelectedVariants] = useState<RecipeVariant[]>(
    initialData?.variants ?? [],
  );
  const [categories, setCategories] = useState(
    (initialData?.categories ?? []).join(", "),
  );
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients?.length
      ? initialData.ingredients
      : [{ ...emptyIngredient }],
  );
  const [steps, setSteps] = useState(
    initialData?.steps?.length ? initialData.steps : [{ ...emptyStep }],
  );

  const [scanningForIndex, setScanningForIndex] = useState<number | null>(null);
  const [lookingUpIndex, setLookingUpIndex] = useState<number | null>(null);
  const barcodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function looksLikeBarcode(value: string) {
    return /^\d{8,14}$/.test(value.trim());
  }

  async function lookupBarcode(index: number, barcode: string) {
    setLookingUpIndex(index);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode.trim()}.json`
      );
      const data = await res.json();
      const name =
        data.status === 1
          ? (data.product.product_name_de || data.product.product_name || "").trim()
          : "";
      if (name) updateIngredient(index, "name", name);
    } finally {
      setLookingUpIndex(null);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setImageUrl(data.url);
    } else {
      setError(data.error ?? "Bild-Upload fehlgeschlagen.");
    }
    setUploading(false);
  }

  function updateIngredient(
    index: number,
    field: "name" | "amount" | "unit",
    value: string,
  ) {
    setIngredients((prev) =>
      prev.map((ing, i) =>
        i === index
          ? {
              ...ing,
              [field]:
                field === "amount"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : value,
            }
          : ing,
      ),
    );

    if (field === "name" && looksLikeBarcode(value)) {
      if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
      barcodeTimerRef.current = setTimeout(() => lookupBarcode(index, value), 600);
    }
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { description: value } : s)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      servings: servings === "" ? 1 : servings,
      prepTime: prepTime === "" ? null : prepTime,
      imageUrl: imageUrl.trim() || null,
      variants: selectedVariants,
      categories: categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      ingredients: ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({
          name: ing.name.trim(),
          amount: ing.amount === "" ? null : ing.amount,
          unit: ing.unit.trim() || null,
        })),
      steps: steps
        .filter((s) => s.description.trim())
        .map((s, i) => ({ order: i + 1, description: s.description.trim() })),
    };

    if (!payload.title) {
      setError("Bitte gib einen Titel ein.");
      setSubmitting(false);
      return;
    }

    const url = isEdit ? `/api/recipes/${initialData!.id}` : "/api/recipes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const recipe = await res.json();
      router.push(`/recipes/${recipe.id}`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Speichern fehlgeschlagen.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Titel *
          </label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Spaghetti Carbonara"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Beschreibung
          </label>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kurze Beschreibung des Rezepts"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Portionen
            </label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={servings}
              onChange={(e) =>
                setServings(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Zubereitungszeit (Min.)
            </label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={prepTime}
              onChange={(e) =>
                setPrepTime(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Foto
          </label>
          {imageUrl && (
            <div className="mb-2 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Vorschau"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700">
            <span>{uploading ? "Wird hochgeladen…" : imageUrl ? "Anderes Foto wählen" : "Foto hochladen"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Art des Gerichts
          </label>
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((v) => {
              const isActive = selectedVariants.includes(v.value);
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() =>
                    setSelectedVariants((prev) =>
                      isActive
                        ? prev.filter((x) => x !== v.value)
                        : [...prev, v.value],
                    )
                  }
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? v.activeClass
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{v.emoji}</span>
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Kategorien (kommagetrennt)
          </label>
          <input
            className={inputClass}
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Dessert, Pasta"
          />
        </div>
      </div>

      {/* Zutaten */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Zutaten</h2>
          <button
            type="button"
            onClick={() =>
              setIngredients((prev) => [...prev, { ...emptyIngredient }])
            }
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-500 hover:bg-brand-50"
          >
            <span className="text-base leading-none">+</span> Zutat
          </button>
        </div>
        <div className="grid grid-cols-[1fr_80px_90px_32px] gap-x-2 pb-1 text-xs font-medium text-slate-400">
          <span>Zutat</span>
          <span>Menge</span>
          <span>Einheit</span>
          <span />
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_90px_32px] items-center gap-x-2">
              <div className="relative">
                <input
                  className={`${inputClass} pr-8`}
                  placeholder="z.B. Mehl"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                />
                {lookingUpIndex === i ? (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setScanningForIndex(i)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-brand-500"
                    tabIndex={-1}
                    title="Barcode scannen"
                    aria-label="Barcode scannen"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M2 4h2v16H2V4zm3 0h1v16H5V4zm2 0h3v16H7V4zm4 0h1v16h-1V4zm2 0h2v16h-2V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4z"/>
                    </svg>
                  </button>
                )}
              </div>
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="200"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
              />
              <select
                className={inputClass}
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
              >
                <option value="">—</option>
                {UNITS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  setIngredients((prev) =>
                    prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Zutat entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schritte */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Zubereitung</h2>
          <button
            type="button"
            onClick={() => setSteps((prev) => [...prev, { ...emptyStep }])}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:border-brand-500 hover:bg-brand-50"
          >
            <span className="text-base leading-none">+</span> Schritt
          </button>
        </div>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
                {i + 1}
              </span>
              <textarea
                className={`${inputClass} flex-1`}
                rows={2}
                placeholder="Schritt beschreiben…"
                value={step.description}
                onChange={(e) => updateStep(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setSteps((prev) =>
                    prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                  )
                }
                className="px-2 text-slate-400 hover:text-red-500"
                aria-label="Schritt entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-500 hover:shadow-md disabled:opacity-50"
        >
          {submitting
            ? "Speichern…"
            : isEdit
              ? "Änderungen speichern"
              : "Rezept erstellen"}
        </button>
      </div>

      {scanningForIndex !== null && (
        <BarcodeScanner
          onResult={(name) => {
            updateIngredient(scanningForIndex, "name", name);
            setScanningForIndex(null);
          }}
          onClose={() => setScanningForIndex(null)}
        />
      )}
    </form>
  );
}
