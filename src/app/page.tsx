import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Alle Rezepte</h1>
        <p className="mt-1 text-stone-500">
          {recipes.length}{" "}
          {recipes.length === 1 ? "Rezept" : "Rezepte"} in deiner Sammlung
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-stone-500">
            Noch keine Rezepte vorhanden.{" "}
            <Link
              href="/recipes/new"
              className="font-medium text-brand-600 hover:underline"
            >
              Erstelle dein erstes Rezept
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
              className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="aspect-video w-full overflow-hidden bg-stone-100">
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-stone-900 group-hover:text-brand-600">
                  {recipe.title}
                </h2>
                {recipe.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                    {recipe.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span>🍽️ {recipe.servings} Portionen</span>
                  {recipe.prepTime != null && (
                    <span>⏱️ {recipe.prepTime} Min.</span>
                  )}
                </div>
                {recipe.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
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
