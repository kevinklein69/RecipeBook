import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RecipeForm, { type RecipeFormData } from "@/components/RecipeForm";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
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

  const initialData: RecipeFormData = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description ?? "",
    servings: recipe.servings,
    prepTime: recipe.prepTime ?? "",
    imageUrl: recipe.imageUrl ?? "",
    categories: recipe.categories.map((c) => c.name),
    ingredients: recipe.ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount ?? "",
      unit: ing.unit ?? "",
    })),
    steps: recipe.steps.map((s) => ({ description: s.description })),
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          ← Zurück zum Rezept
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-stone-900">
          Rezept bearbeiten
        </h1>
      </div>
      <RecipeForm initialData={initialData} />
    </div>
  );
}
