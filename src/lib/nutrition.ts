const GRAMS_PER_UNIT: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  ml: 1,
  l: 1000,
  cl: 10,
};

export function gramsForAmount(
  amount: number | null | undefined,
  unit: string | null | undefined,
): number | null {
  if (amount == null || !unit) return null;
  const factor = GRAMS_PER_UNIT[unit];
  return factor != null ? amount * factor : null;
}

export function ingredientKcal(ing: {
  amount?: number | null;
  unit?: string | null;
  caloriesPer100g?: number | null;
}): number | null {
  if (ing.caloriesPer100g == null) return null;
  const grams = gramsForAmount(ing.amount, ing.unit);
  if (grams == null) return null;
  return (grams / 100) * ing.caloriesPer100g;
}

export function totalKcal(
  ingredients: {
    amount?: number | null;
    unit?: string | null;
    caloriesPer100g?: number | null;
  }[],
): { kcal: number; complete: boolean } {
  let kcal = 0;
  let complete = ingredients.length > 0;
  for (const ing of ingredients) {
    const value = ingredientKcal(ing);
    if (value == null) {
      complete = false;
      continue;
    }
    kcal += value;
  }
  return { kcal, complete };
}
