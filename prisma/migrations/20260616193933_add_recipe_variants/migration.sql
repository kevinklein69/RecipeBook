-- CreateEnum
CREATE TYPE "RecipeVariant" AS ENUM ('VEGETARISCH', 'VEGAN', 'FLEISCH', 'FISCH', 'GEFLUEGEL');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "variants" "RecipeVariant"[];
