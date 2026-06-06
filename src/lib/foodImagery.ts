export const FOOD_IMAGES = {
  hero: "/images/food/hero-pizzeria.jpg",
  pizza: "/images/food/pizza.jpg",
  pasta: "/images/food/pasta.jpg",
  salads: "/images/food/salad.jpg",
  alforno: "/images/food/alforno.jpg",
  classics: "/images/food/classics.jpg",
  dining: "/images/food/gallery-dining.jpg"
} as const

export type DishKind = keyof typeof FOOD_IMAGES

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function dishKindForName(name: string, categoryName = ""): DishKind {
  const n = normalize(name)
  const c = normalize(categoryName)

  if (/salat|insalata|caprese/.test(n) || /salat/.test(c)) return "salads"
  if (/al forno|auflauf|lasagne|uberbacken|gratin/.test(n) || /al forno/.test(c)) return "alforno"
  if (/schnitzel|baguette|burger|grill|cordon|hawaii(?!.*pizza)/.test(n) || /schnitzel|baguette/.test(c)) {
    return "classics"
  }
  if (/pizzabrotchen|pizzabrot/.test(n) || /pizzabrotchen/.test(c)) return "pizza"
  if (/^pizza| pizza /.test(n) || (/pizza/.test(c) && !/pizzabrotchen/.test(c))) return "pizza"
  if (
    /pasta|spaghetti|penne|tagliatelle|carbonara|bolognese|napoli|panna|gorgonzola|salmone|toscana/.test(n) ||
    /pasta/.test(c)
  ) {
    return "pasta"
  }

  return "pizza"
}

export function dishImageForName(name: string, imageUrl?: string | null, categoryName = "") {
  if (imageUrl) return imageUrl
  const kind = dishKindForName(name, categoryName)
  return FOOD_IMAGES[kind]
}

export const GALLERY_IMAGES = [
  { src: FOOD_IMAGES.pasta, key: "pasta" },
  { src: FOOD_IMAGES.pizza, key: "pizza" },
  { src: FOOD_IMAGES.salads, key: "salads" },
  { src: FOOD_IMAGES.dining, key: "dining" }
] as const
