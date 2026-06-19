import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RecipeVariant } from "@/lib/variants";

export const dynamic = "force-dynamic";

// GET /api/recipes – Liste aller Rezepte
export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });
  return NextResponse.json(recipes);
}

type IngredientInput = {
  name: string;
  amount?: number | null;
  unit?: string | null;
  caloriesPer100g?: number | null;
};
type StepInput = { order: number; description: string };

// POST /api/recipes – neues Rezept anlegen
export async function POST(request: Request) {
  try {
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

    const recipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description: description ?? null,
        servings: servings ?? 1,
        prepTime: prepTime ?? null,
        imageUrl: imageUrl ?? null,
        variants,
        categories: {
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

    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error("POST /api/recipes failed:", err);
    return NextResponse.json(
      { error: "Rezept konnte nicht erstellt werden." },
      { status: 500 },
    );
  }
}
