export const FOOD_IMAGE_VERSION = "20260622"

export const HERO_OVEN_LOOP = `/videos/hero-oven-opt.webp?v=${FOOD_IMAGE_VERSION}`
// Regenerate: python scripts/build-hero-oven-loop.py, then node scripts/compress-static-assets.mjs

export const FOOD_IMAGES = {
  hero: `/images/food/concordia-hero-oven-pizza.webp?v=${FOOD_IMAGE_VERSION}`,
  dining: `/images/food/concordia-gallery-dining.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzaMargherita: `/images/food/concordia-dish-pizza.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzaSalami: `/images/food/pizza-salami.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzaHawaii: `/images/food/pizza-hawaii.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzaSeafood: `/images/food/pizza-seafood.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzaVegetarian: `/images/food/pizza-vegetarian.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzaQuattroFormaggi: `/images/food/pizza-quattro-formaggi.webp?v=${FOOD_IMAGE_VERSION}`,
  calzone: `/images/food/calzone.webp?v=${FOOD_IMAGE_VERSION}`,
  pastaTomato: `/images/food/concordia-dish-pasta.webp?v=${FOOD_IMAGE_VERSION}`,
  pastaCarbonara: `/images/food/pasta-carbonara.webp?v=${FOOD_IMAGE_VERSION}`,
  pastaGorgonzola: `/images/food/pasta-gorgonzola.webp?v=${FOOD_IMAGE_VERSION}`,
  pastaSalmone: `/images/food/pasta-salmone.webp?v=${FOOD_IMAGE_VERSION}`,
  saladCaprese: `/images/food/salad-caprese.webp?v=${FOOD_IMAGE_VERSION}`,
  saladMixed: `/images/food/concordia-dish-salad.webp?v=${FOOD_IMAGE_VERSION}`,
  saladChicken: `/images/food/salad-chicken.webp?v=${FOOD_IMAGE_VERSION}`,
  alforno: `/images/food/concordia-dish-alforno.webp?v=${FOOD_IMAGE_VERSION}`,
  doenerAuflauf: `/images/food/doener-auflauf.webp?v=${FOOD_IMAGE_VERSION}`,
  schnitzel: `/images/food/concordia-dish-classics.webp?v=${FOOD_IMAGE_VERSION}`,
  burger: `/images/food/burger.webp?v=${FOOD_IMAGE_VERSION}`,
  baguetteSucuk: `/images/food/baguette-sucuk.webp?v=${FOOD_IMAGE_VERSION}`,
  baguetteDeli: `/images/food/baguette.webp?v=${FOOD_IMAGE_VERSION}`,
  pizzabrotchen: `/images/food/pizzabrotchen.webp?v=${FOOD_IMAGE_VERSION}`,
  imbiss: `/images/food/imbiss-snacks.webp?v=${FOOD_IMAGE_VERSION}`
} as const

export type DishKind = keyof typeof FOOD_IMAGES

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function itemText(name: string, categoryName = "", description?: string | null) {
  return normalize(`${name} ${description ?? ""} ${categoryName}`)
}

export function dishImageForItem(
  name: string,
  imageUrl?: string | null,
  categoryName = "",
  description?: string | null
) {
  if (imageUrl) return imageUrl

  const text = itemText(name, categoryName, description)

  if (/baguette/.test(text)) {
    if (/sucuk|doner|döner/.test(text)) return FOOD_IMAGES.baguetteSucuk
    return FOOD_IMAGES.baguetteDeli
  }

  if (/pizzabrotchen|gefullte pizzabrotchen/.test(text)) return FOOD_IMAGES.pizzabrotchen

  if (/calzone/.test(text)) return FOOD_IMAGES.calzone

  if (/burger/.test(text)) return FOOD_IMAGES.burger

  if (/schnitzel|cordon/.test(text)) {
    return FOOD_IMAGES.schnitzel
  }

  if (/imbiss|pommes|frites|currywurst|nuggets|bratwurst|bockwurst|frikadelle|chicken nuggets/.test(text)) {
    return FOOD_IMAGES.imbiss
  }

  if (/salat|insalata/.test(text)) {
    if (/caprese/.test(text)) return FOOD_IMAGES.saladCaprese
    if (/hahnchen|chicken/.test(text)) return FOOD_IMAGES.saladChicken
    return FOOD_IMAGES.saladMixed
  }

  if (/al forno|auflauf|lasagne|uberbacken|gratin/.test(text)) {
    if (/doner|döner/.test(text)) return FOOD_IMAGES.doenerAuflauf
    return FOOD_IMAGES.alforno
  }

  if (/pasta|spaghetti|penne|tagliatelle|tortellini|carbonara|bolognese|napoli|panna|gorgonzola|salmone|toscana|formaggi|alla chef|vegetarisch/.test(text)) {
    if (/carbonara|alla panna|formaggi|gorgonzola|panna/.test(text)) {
      if (/gorgonzola|formaggi/.test(text)) return FOOD_IMAGES.pastaGorgonzola
      return FOOD_IMAGES.pastaCarbonara
    }
    if (/salmone|lachs|spinat.*lachs|krabben|scampi/.test(text)) return FOOD_IMAGES.pastaSalmone
    return FOOD_IMAGES.pastaTomato
  }

  if (/pizza|partyblech|familien.?pizza/.test(text)) {
    if (/margherita|funghi\b|mozzarella\b|spinaci|broccoli|spargel|napoli\b/.test(text) && !/salami|sucuk|tonno|prosciutto|parma|hawaii|diavolo|scampi|frutti|lachs|bolognese|hahnchen|doner|döner|mexico|vegas|concordia special/.test(text)) {
      return FOOD_IMAGES.pizzaMargherita
    }
    if (/quattro formaggi|4 formaggi|formaggi/.test(text)) return FOOD_IMAGES.pizzaQuattroFormaggi
    if (/hawaii/.test(text)) return FOOD_IMAGES.pizzaHawaii
    if (/tonno|scampi|frutti di mare|lachs|meeres/.test(text)) return FOOD_IMAGES.pizzaSeafood
    if (/vegetar|vegetaria|gemuse|paprika|spinat|broccoli|funghi/.test(text)) return FOOD_IMAGES.pizzaVegetarian
    if (/salami|sucuk|diavolo|parma|prosciutto|peperoni|wurst|bolognese|hahnchen|doner|döner|mexico|rustica|bruno|enzo|chef\b|concordia|vegas|milano|bella|italia/.test(text)) {
      return FOOD_IMAGES.pizzaSalami
    }
    return FOOD_IMAGES.pizzaMargherita
  }

  return FOOD_IMAGES.pizzaMargherita
}

/** @deprecated Use dishImageForItem with description when available */
export function dishKindForName(name: string, categoryName = ""): DishKind {
  const image = dishImageForItem(name, null, categoryName)
  const entry = Object.entries(FOOD_IMAGES).find(([, src]) => src === image)
  return (entry?.[0] as DishKind) ?? "pizzaMargherita"
}

export function dishImageForName(
  name: string,
  imageUrl?: string | null,
  categoryName = "",
  description?: string | null
) {
  return dishImageForItem(name, imageUrl, categoryName, description)
}

export const GALLERY_IMAGES = [
  { src: FOOD_IMAGES.hero, key: "pizza" },
  {
    src: `/images/food/concordia-gallery-kitchen.webp?v=${FOOD_IMAGE_VERSION}`,
    key: "alforno"
  },
  { src: FOOD_IMAGES.pastaTomato, key: "pasta" },
  { src: FOOD_IMAGES.saladMixed, key: "salads" },
  { src: FOOD_IMAGES.dining, key: "dining" },
  { src: FOOD_IMAGES.schnitzel, key: "classics" },
  { src: FOOD_IMAGES.baguetteSucuk, key: "baguette" }
] as const
