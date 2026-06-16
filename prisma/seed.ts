import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate (Reihenfolge wegen Foreign Keys; Recipe-Delete cascaded
  // Ingredients & Steps, Kategorien räumen wir separat ab).
  await prisma.recipe.deleteMany();
  await prisma.category.deleteMany();

  const dessert = await prisma.category.create({ data: { name: "Dessert" } });
  const pasta = await prisma.category.create({ data: { name: "Pasta" } });
  const vegetarisch = await prisma.category.create({
    data: { name: "Vegetarisch" },
  });

  await prisma.recipe.create({
    data: {
      title: "Spaghetti Aglio e Olio",
      description:
        "Der italienische Klassiker für hungrige Abende – mit nur wenigen Zutaten in 15 Minuten fertig.",
      servings: 2,
      prepTime: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
      categories: { connect: [{ id: pasta.id }, { id: vegetarisch.id }] },
      ingredients: {
        create: [
          { name: "Spaghetti", amount: 200, unit: "g" },
          { name: "Knoblauchzehen", amount: 4, unit: "Stück" },
          { name: "Olivenöl", amount: 6, unit: "EL" },
          { name: "Chiliflocken", amount: 1, unit: "TL" },
          { name: "Petersilie", amount: 1, unit: "Bund" },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            description:
              "Spaghetti in reichlich Salzwasser al dente kochen.",
          },
          {
            order: 2,
            description:
              "Knoblauch in dünne Scheiben schneiden und in Olivenöl bei mittlerer Hitze goldgelb anbraten. Chiliflocken hinzufügen.",
          },
          {
            order: 3,
            description:
              "Spaghetti abgießen, etwas Nudelwasser auffangen und alles in der Pfanne vermengen.",
          },
          {
            order: 4,
            description:
              "Mit gehackter Petersilie bestreuen und sofort servieren.",
          },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: "Klassisches Tiramisu",
      description:
        "Cremiges italienisches Dessert mit Mascarpone, Espresso und Löffelbiskuits.",
      servings: 6,
      prepTime: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
      categories: { connect: [{ id: dessert.id }] },
      ingredients: {
        create: [
          { name: "Mascarpone", amount: 500, unit: "g" },
          { name: "Eier", amount: 4, unit: "Stück" },
          { name: "Zucker", amount: 100, unit: "g" },
          { name: "Löffelbiskuits", amount: 200, unit: "g" },
          { name: "Espresso", amount: 300, unit: "ml" },
          { name: "Kakaopulver", amount: 2, unit: "EL" },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            description:
              "Eigelb mit Zucker schaumig schlagen, Mascarpone unterrühren.",
          },
          {
            order: 2,
            description: "Eiweiß steif schlagen und vorsichtig unterheben.",
          },
          {
            order: 3,
            description:
              "Löffelbiskuits kurz in abgekühlten Espresso tauchen und in eine Form schichten.",
          },
          {
            order: 4,
            description:
              "Abwechselnd Creme und Biskuits schichten. Mindestens 4 Stunden kühlen und vor dem Servieren mit Kakao bestäuben.",
          },
        ],
      },
    },
  });

  await prisma.recipe.create({
    data: {
      title: "Cremiges Pilzrisotto",
      description:
        "Würziges Risotto mit braunen Champignons und Parmesan – Soulfood pur.",
      servings: 4,
      prepTime: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800",
      categories: { connect: [{ id: vegetarisch.id }] },
      ingredients: {
        create: [
          { name: "Risotto-Reis", amount: 320, unit: "g" },
          { name: "Champignons", amount: 300, unit: "g" },
          { name: "Gemüsebrühe", amount: 1, unit: "l" },
          { name: "Weißwein", amount: 100, unit: "ml" },
          { name: "Zwiebel", amount: 1, unit: "Stück" },
          { name: "Parmesan", amount: 60, unit: "g" },
          { name: "Butter", amount: 30, unit: "g" },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            description:
              "Zwiebel fein würfeln und in Butter glasig dünsten. Reis hinzufügen und kurz anrösten.",
          },
          {
            order: 2,
            description:
              "Mit Weißwein ablöschen und einkochen lassen.",
          },
          {
            order: 3,
            description:
              "Nach und nach heiße Brühe zugeben und unter Rühren ca. 18 Minuten köcheln, bis der Reis cremig ist.",
          },
          {
            order: 4,
            description:
              "Champignons separat anbraten, unterheben und mit geriebenem Parmesan abschmecken.",
          },
        ],
      },
    },
  });

  console.log("✅ Seeding abgeschlossen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
