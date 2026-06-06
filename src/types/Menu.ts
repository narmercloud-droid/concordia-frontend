export interface MenuCategory {
  id: string
  name: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
}
