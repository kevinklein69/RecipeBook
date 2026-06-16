"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type RecipeFormData = {
  id?: string;
  title: string;
  description: string;
  servings: number;
  prepTime: number | "";
  imageUrl: string;
  categories: string[];
  ingredients: { name: string; amount: number | ""; unit: string }[];
  steps: { description: string }[];
};

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
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
          <label className="mb-1 block text-sm font-medium text-stone-700">
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
            <label className="mb-1 block text-sm font-medium text-stone-700">
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
            <label className="mb-1 block text-sm font-medium text-stone-700">
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
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Bild-URL
          </label>
          <input
            className={inputClass}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
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
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Zutaten</h2>
          <button
            type="button"
            onClick={() =>
              setIngredients((prev) => [...prev, { ...emptyIngredient }])
            }
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            + Zutat
          </button>
        </div>
        <div className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${inputClass} flex-1`}
                placeholder="Name"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
              />
              <input
                type="number"
                className={`${inputClass} w-24`}
                placeholder="Menge"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
              />
              <input
                className={`${inputClass} w-24`}
                placeholder="Einheit"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setIngredients((prev) =>
                    prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
                  )
                }
                className="px-2 text-stone-400 hover:text-red-500"
                aria-label="Zutat entfernen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schritte */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Zubereitung</h2>
          <button
            type="button"
            onClick={() => setSteps((prev) => [...prev, { ...emptyStep }])}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            + Schritt
          </button>
        </div>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600">
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
                className="px-2 text-stone-400 hover:text-red-500"
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
          className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting
            ? "Speichern…"
            : isEdit
              ? "Änderungen speichern"
              : "Rezept erstellen"}
        </button>
      </div>
    </form>
  );
}
