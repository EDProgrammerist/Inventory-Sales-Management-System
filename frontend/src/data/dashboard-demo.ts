// Reference-design fixtures. These figures are not records from the connected database.
export const monthlyActivity = [
  { month: 'Jan', purchase: 55000, sales: 49000, ordered: 3800, delivered: 3200 },
  { month: 'Feb', purchase: 58000, sales: 48000, ordered: 2700, delivered: 3700 },
  { month: 'Mar', purchase: 45000, sales: 53000, ordered: 2500, delivered: 3500 },
  { month: 'Apr', purchase: 37000, sales: 44000, ordered: 1400, delivered: 3600 },
  { month: 'May', purchase: 44000, sales: 47000, ordered: 2250, delivered: 3350 },
  { month: 'Jun', purchase: 29000, sales: 42000, ordered: 2100, delivered: 3100 },
  { month: 'Jul', purchase: 55000, sales: 49000, ordered: 2800, delivered: 3400 },
  { month: 'Aug', purchase: 45000, sales: 42000, ordered: 2400, delivered: 3000 },
  { month: 'Sep', purchase: 45000, sales: 44000, ordered: 2650, delivered: 3600 },
  { month: 'Oct', purchase: 37000, sales: 44000, ordered: 2300, delivered: 3450 },
]

export type ChartPeriod = 'monthly' | 'quarterly'

export function activityForPeriod(period: ChartPeriod) {
  if (period === 'monthly') return monthlyActivity
  return [0, 3, 6, 9].map((start, index) => {
    const months = monthlyActivity.slice(start, start + 3)
    return {
      month: `Q${index + 1}${months.length < 3 ? ' to date' : ''}`,
      purchase: months.reduce((sum, item) => sum + item.purchase, 0),
      sales: months.reduce((sum, item) => sum + item.sales, 0),
      ordered: months.reduce((sum, item) => sum + item.ordered, 0),
      delivered: months.reduce((sum, item) => sum + item.delivered, 0),
    }
  })
}

export interface StockItem {
  name: string
  remaining: number
  sold?: number
  price?: number
  image?: string
}

export const topStock: StockItem[] = [
  { name: 'Surf Excel', sold: 30, remaining: 12, price: 100 },
  { name: 'Rin', sold: 21, remaining: 15, price: 207 },
  { name: 'Parle G', sold: 19, remaining: 17, price: 105 },
]

export const lowStock: StockItem[] = [
  { name: 'Tata Salt', remaining: 10, image: '/dashboard/tata-salt.png' },
  { name: 'Lays', remaining: 15, image: '/dashboard/lays.png' },
  { name: 'Nova', remaining: 15, image: '/dashboard/nova.png' },
]

export function filterStock(items: StockItem[], query: string) {
  const search = query.trim().toLocaleLowerCase()
  return items.filter((item) => item.name.toLocaleLowerCase().includes(search))
}
