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
      <div className="mb-7">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Alle Rezepte
        </h1>
        <p className="mt-2 text-slate-500">
          {recipes.length}{" "}
          {activeVariant && `von ${totalCount} `}
          {recipes.length === 1 ? "Rezept" : "Rezepte"}{" "}
          {activeVariant && "gefiltert"}
        </p>
      </div>

      {/* Varianten-Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/"
          className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
            !activeVariant
              ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-200"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          Alle
        </Link>
        {VARIANTS.map((v) => (
          <Link
            key={v.value}
            href={activeVariant === v.value ? "/" : `/?variant=${v.value}`}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
              activeVariant === v.value
                ? v.activeClass + " shadow-md"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>{v.emoji}</span>
            {v.label}
          </Link>
        ))}
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 p-12 text-center">
          <div className="mb-3 text-5xl">🍳</div>
          <p className="text-slate-500">
            {activeVariant
              ? `Keine ${variantMeta(activeVariant).label}-Rezepte vorhanden.`
              : "Noch keine Rezepte vorhanden."}{" "}
            <Link
              href="/recipes/new"
              className="font-semibold text-brand-600 hover:underline"
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
              className="group overflow-hidden rounded-3xl bg-white shadow-[0_2px_16px_rgba(15,23,42,0.07)] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(37,99,235,0.16)]"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-slate-900 transition-colors duration-150 group-hover:text-brand-600">
                  {recipe.title}
                </h2>
                {recipe.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {recipe.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
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
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.badgeClass}`}
                        >
                          {meta.emoji} {meta.label}
                        </span>
                      );
                    })}
                    {recipe.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700"
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
