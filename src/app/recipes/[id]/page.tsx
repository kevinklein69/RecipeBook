import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import { variantMeta, type RecipeVariant } from "@/lib/variants";
import { ingredientKcal, totalKcal } from "@/lib/nutrition";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      steps: { orderBy: { order: "asc" } },
      categories: true,
    },
  });

  if (!recipe) notFound();

  const { kcal, complete } = totalKcal(recipe.ingredients);
  const kcalPerServing = recipe.servings > 0 ? kcal / recipe.servings : kcal;

  return (
    <article>
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-slate-500 transition-colors hover:text-brand-600"
        >
          ← Zurück zur Übersicht
        </Link>
      </div>

      {recipe.imageUrl && (
        <div className="mb-6 aspect-[16/7] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-[0_2px_20px_rgba(15,23,42,0.08)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-2 max-w-2xl text-slate-600">
              {recipe.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-brand-300 hover:bg-slate-50"
          >
            Bearbeiten
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
        <span className="rounded-full bg-slate-100 px-3.5 py-1.5">
          🍽️ {recipe.servings} Portionen
        </span>
        {recipe.prepTime != null && (
          <span className="rounded-full bg-slate-100 px-3.5 py-1.5">
            ⏱️ {recipe.prepTime} Min.
          </span>
        )}
        {kcal > 0 && (
          <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-brand-700">
            🔥 {complete ? "" : "≥ "}
            {Math.round(kcal)} kcal gesamt · {Math.round(kcalPerServing)}{" "}
            kcal/Portion
          </span>
        )}
        {(recipe.variants as RecipeVariant[]).map((v) => {
          const meta = variantMeta(v);
          return (
            <span
              key={v}
              className={`rounded-full px-3.5 py-1.5 ${meta.badgeClass}`}
            >
              {meta.emoji} {meta.label}
            </span>
          );
        })}
        {recipe.categories.map((cat) => (
          <span
            key={cat.id}
            className="rounded-full bg-brand-50 px-3.5 py-1.5 text-brand-700"
          >
            {cat.name}
          </span>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <section className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)] md:col-span-1">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Zutaten</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => {
              const kcalValue = ingredientKcal(ing);
              return (
                <li
                  key={ing.id}
                  className="flex justify-between border-b border-slate-100 pb-2 text-sm"
                >
                  <span className="text-slate-700">{ing.name}</span>
                  <span className="text-right font-medium text-slate-500">
                    {ing.amount != null ? ing.amount : ""} {ing.unit ?? ""}
                    {kcalValue != null && (
                      <span className="ml-1.5 text-brand-600">
                        · {Math.round(kcalValue)} kcal
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
            {recipe.ingredients.length === 0 && (
              <li className="text-sm text-slate-400">Keine Zutaten erfasst.</li>
            )}
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.06)] md:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Zubereitung
          </h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm shadow-brand-200">
                  {step.order}
                </span>
                <p className="pt-1 text-slate-700">{step.description}</p>
              </li>
            ))}
            {recipe.steps.length === 0 && (
              <li className="text-sm text-slate-400">
                Keine Zubereitungsschritte erfasst.
              </li>
            )}
          </ol>
        </section>
      </div>
    </article>
  );
}
