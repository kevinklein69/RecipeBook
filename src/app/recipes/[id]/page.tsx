import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import { variantMeta, type RecipeVariant } from "@/lib/variants";

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
        <div className="mb-6 aspect-[16/7] w-full overflow-hidden rounded-xl bg-slate-100">
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
          <h1 className="text-3xl font-bold text-slate-900">{recipe.title}</h1>
          {recipe.description && (
            <p className="mt-2 max-w-2xl text-slate-600">
              {recipe.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-brand-300"
          >
            Bearbeiten
          </Link>
          <DeleteRecipeButton id={recipe.id} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">
          🍽️ {recipe.servings} Portionen
        </span>
        {recipe.prepTime != null && (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            ⏱️ {recipe.prepTime} Min.
          </span>
        )}
        {(recipe.variants as RecipeVariant[]).map((v) => {
          const meta = variantMeta(v);
          return (
            <span
              key={v}
              className={`rounded-full px-3 py-1 font-medium ${meta.badgeClass}`}
            >
              {meta.emoji} {meta.label}
            </span>
          );
        })}
        {recipe.categories.map((cat) => (
          <span
            key={cat.id}
            className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700"
          >
            {cat.name}
          </span>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
        <section className="md:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Zutaten
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.id}
                className="flex justify-between border-b border-slate-100 pb-2 text-sm"
              >
                <span className="text-slate-700">{ing.name}</span>
                <span className="text-slate-500">
                  {ing.amount != null ? ing.amount : ""} {ing.unit ?? ""}
                </span>
              </li>
            ))}
            {recipe.ingredients.length === 0 && (
              <li className="text-sm text-slate-400">Keine Zutaten erfasst.</li>
            )}
          </ul>
        </section>

        <section className="md:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Zubereitung
          </h2>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.id} className="flex gap-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {step.order}
                </span>
                <p className="pt-0.5 text-slate-700">{step.description}</p>
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
