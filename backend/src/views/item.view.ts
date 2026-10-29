import type { Item } from '@/models/item.model'

export function toItemResponse(item: Item) {
  return { id: item.id, name: item.name, description: item.description }
}
