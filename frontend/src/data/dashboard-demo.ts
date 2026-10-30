// Empty chart series; no sales or purchase transaction source is connected.
export const monthlyActivity = [
  { month: 'Jan', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Feb', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Mar', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Apr', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'May', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Jun', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Jul', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Aug', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Sep', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
  { month: 'Oct', purchase: 0, sales: 0, ordered: 0, delivered: 0 },
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

export const topStock: StockItem[] = []

export const lowStock: StockItem[] = []

export function filterStock(items: StockItem[], query: string) {
  const search = query.trim().toLocaleLowerCase()
  return items.filter((item) => item.name.toLocaleLowerCase().includes(search))
}
