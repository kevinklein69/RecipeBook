import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VARIANTS, variantMeta, type RecipeVariant } from "@/lib/variants";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  const { variant } = await searchParams;
  const activeVariant = VARIANTS.some((v) => v.value === variant)
    ? (variant as RecipeVariant)
    : null;

  const recipes = await prisma.recipe.findMany({
    where: activeVariant ? { variants: { has: activeVariant } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  const totalCount = activeVariant
    ? await prisma.recipe.count()
    : recipes.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Alle Rezepte</h1>
        <p className="mt-1 text-slate-500">
          {recipes.length}{" "}
          {activeVariant && `von ${totalCount} `}
          {recipes.length === 1 ? "Rezept" : "Rezepte"}{" "}
          {activeVariant && "gefiltert"}
        </p>
      </div>

      {/* Varianten-Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !activeVariant
              ? "border-slate-800 bg-slate-800 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Alle
        </Link>
        {VARIANTS.map((v) => (
          <Link
            key={v.value}
            href={activeVariant === v.value ? "/" : `/?variant=${v.value}`}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeVariant === v.value
                ? v.activeClass
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>{v.emoji}</span>
            {v.label}
          </Link>
        ))}
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center">
          <div className="mb-3 text-5xl">🍳</div>
          <p className="text-slate-500">
            {activeVariant
              ? `Keine ${variantMeta(activeVariant).label}-Rezepte vorhanden.`
              : "Noch keine Rezepte vorhanden."}{" "}
            <Link
              href="/recipes/new"
              className="font-medium text-brand-600 hover:underline"
            >
              {activeVariant ? "Rezept erstellen" : "Erstelle dein erstes Rezept"}
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/60"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors duration-150">
                  {recipe.title}
                </h2>
                {recipe.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {recipe.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>🍽️ {recipe.servings} Portionen</span>
                  {recipe.prepTime != null && (
                    <span>⏱️ {recipe.prepTime} Min.</span>
                  )}
                </div>
                {(recipe.variants.length > 0 || recipe.categories.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(recipe.variants as RecipeVariant[]).map((v) => {
                      const meta = variantMeta(v);
                      return (
                        <span
                          key={v}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClass}`}
                        >
                          {meta.emoji} {meta.label}
                        </span>
                      );
                    })}
                    {recipe.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
