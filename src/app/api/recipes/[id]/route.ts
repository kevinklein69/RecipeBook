import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RecipeVariant } from "@/lib/variants";

export const dynamic = "force-dynamic";

type IngredientInput = {
  name: string;
  amount?: number | null;
  unit?: string | null;
  caloriesPer100g?: number | null;
};
type StepInput = { order: number; description: string };

// GET /api/recipes/[id] – einzelnes Rezept
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      steps: { orderBy: { order: "asc" } },
      categories: true,
    },
  });

  if (!recipe) {
    return NextResponse.json(
      { error: "Rezept nicht gefunden." },
      { status: 404 },
    );
  }

  return NextResponse.json(recipe);
}

// PUT /api/recipes/[id] – Rezept aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      servings,
      prepTime,
      imageUrl,
      variants = [],
      categories = [],
      ingredients = [],
      steps = [],
    } = body as {
      title?: string;
      description?: string | null;
      servings?: number;
      prepTime?: number | null;
      imageUrl?: string | null;
      variants?: RecipeVariant[];
      categories?: string[];
      ingredients?: IngredientInput[];
      steps?: StepInput[];
    };

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Titel ist erforderlich." },
        { status: 400 },
      );
    }

    const existing = await prisma.recipe.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Rezept nicht gefunden." },
        { status: 404 },
      );
    }

    // Zutaten & Schritte werden komplett ersetzt – das ist für ein
    // einfaches Formular am robustesten. In einer Transaktion gekapselt,
    // damit der Datensatz nie in einem halben Zustand stehen bleibt.
    const recipe = await prisma.$transaction(async (tx) => {
      await tx.ingredient.deleteMany({ where: { recipeId: id } });
      await tx.step.deleteMany({ where: { recipeId: id } });

      return tx.recipe.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description ?? null,
          servings: servings ?? 1,
          prepTime: prepTime ?? null,
          imageUrl: imageUrl ?? null,
          variants,
          categories: {
            set: [],
            connectOrCreate: categories.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
          ingredients: {
            create: ingredients.map((ing) => ({
              name: ing.name,
              amount: ing.amount ?? null,
              unit: ing.unit ?? null,
              caloriesPer100g: ing.caloriesPer100g ?? null,
            })),
          },
          steps: {
            create: steps.map((s) => ({
              order: s.order,
              description: s.description,
            })),
          },
        },
        include: { ingredients: true, steps: true, categories: true },
      });
    });

    return NextResponse.json(recipe);
  } catch (err) {
    console.error("PUT /api/recipes/[id] failed:", err);
    return NextResponse.json(
      { error: "Rezept konnte nicht aktualisiert werden." },
      { status: 500 },
    );
  }
}

// DELETE /api/recipes/[id] – Rezept löschen
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.recipe.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/recipes/[id] failed:", err);
    return NextResponse.json(
      { error: "Rezept konnte nicht gelöscht werden." },
      { status: 500 },
    );
  }
}
