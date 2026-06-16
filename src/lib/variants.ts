export type RecipeVariant = "VEGETARISCH" | "VEGAN" | "FLEISCH" | "FISCH" | "GEFLUEGEL";

export const VARIANTS: {
  value: RecipeVariant;
  label: string;
  emoji: string;
  badgeClass: string;
  activeClass: string;
}[] = [
  {
    value: "VEGETARISCH",
    label: "Vegetarisch",
    emoji: "🥗",
    badgeClass: "bg-green-100 text-green-700",
    activeClass: "bg-green-500 text-white border-green-500",
  },
  {
    value: "VEGAN",
    label: "Vegan",
    emoji: "🌱",
    badgeClass: "bg-emerald-100 text-emerald-700",
    activeClass: "bg-emerald-500 text-white border-emerald-500",
  },
  {
    value: "FLEISCH",
    label: "Fleisch",
    emoji: "🥩",
    badgeClass: "bg-red-100 text-red-700",
    activeClass: "bg-red-500 text-white border-red-500",
  },
  {
    value: "FISCH",
    label: "Fisch",
    emoji: "🐟",
    badgeClass: "bg-blue-100 text-blue-700",
    activeClass: "bg-blue-500 text-white border-blue-500",
  },
  {
    value: "GEFLUEGEL",
    label: "Geflügel",
    emoji: "🍗",
    badgeClass: "bg-amber-100 text-amber-700",
    activeClass: "bg-amber-500 text-white border-amber-500",
  },
];

export function variantMeta(value: RecipeVariant) {
  return VARIANTS.find((v) => v.value === value)!;
}
