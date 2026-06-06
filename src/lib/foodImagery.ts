export const FOOD_IMAGES = {
  hero: "/images/food/hero-oven-pizza.jpg",
  pizza: "/images/food/pizza.jpg",
  pasta: "/images/food/pasta.jpg",
  salads: "/images/food/salad.jpg",
  alforno: "/images/food/alforno.jpg",
  classics: "/images/food/pizza.jpg",
  kitchen: "/images/food/kitchen.jpg"
} as const

export function dishImageForName(name: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl
  const n = name.toLowerCase()
  if (/pizza/.test(n)) return FOOD_IMAGES.pizza
  if (/pasta|spaghetti|penne|tagliatelle|lasagne|carbonara|bolognese/.test(n)) return FOOD_IMAGES.pasta
  if (/salat|insalata|caprese/.test(n)) return FOOD_IMAGES.salads
  if (/al forno|auflauf|lasagne|überbacken/.test(n)) return FOOD_IMAGES.alforno
  if (/schnitzel|burger|grill|baguette/.test(n)) return FOOD_IMAGES.classics
  return FOOD_IMAGES.pizza
}

export const GALLERY_IMAGES = [
  { src: FOOD_IMAGES.hero, key: "oven" },
  { src: FOOD_IMAGES.pizza, key: "pizza" },
  { src: FOOD_IMAGES.pasta, key: "pasta" },
  { src: FOOD_IMAGES.kitchen, key: "kitchen" }
] as const
