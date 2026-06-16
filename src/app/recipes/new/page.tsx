import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 transition-colors hover:text-brand-600">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Neues Rezept
        </h1>
      </div>
      <RecipeForm />
    </div>
  );
}
