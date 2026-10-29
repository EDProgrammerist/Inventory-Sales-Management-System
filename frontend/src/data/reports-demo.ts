import { toCsv } from './csv.ts'

// Sample snapshots transcribed from Reports-ref-design.png, independent of live inventory.
export const reportOverview = {
  totalProfit: 21190,
  revenue: 18300,
  sales: 17432,
  netPurchase: 117432,
  netSales: 80432,
  momProfit: 30432,
  yoyProfit: 110432,
}

export interface ReportCategory {
  id: string
  name: string
  turnover: number
  increase: number
}
export const reportCategories: ReportCategory[] = [
  { id: 'vegetables', name: 'Vegetable', turnover: 26000, increase: 3.2 },
  { id: 'instant-food', name: 'Instant Food', turnover: 22000, increase: 2 },
  { id: 'households', name: 'Households', turnover: 22000, increase: 1.5 },
]

export interface ReportProduct {
  id: string
  name: string
  productId: string
  categoryId: string
  category: string
  remaining: number
  unit: string
  turnover: number
  increase: number
}
export const reportProducts: ReportProduct[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    productId: '23567',
    categoryId: 'vegetables',
    category: 'Vegetable',
    remaining: 225,
    unit: 'kg',
    turnover: 17000,
    increase: 2.3,
  },
  {
    id: 'onion',
    name: 'Onion',
    productId: '25831',
    categoryId: 'vegetables',
    category: 'Vegetable',
    remaining: 200,
    unit: 'kg',
    turnover: 12000,
    increase: 1.3,
  },
  {
    id: 'maggi',
    name: 'Maggi',
    productId: '56841',
    categoryId: 'instant-food',
    category: 'Instant Food',
    remaining: 200,
    unit: 'Packet',
    turnover: 10000,
    increase: 1.3,
  },
  {
    id: 'surf-excel',
    name: 'Surf Excel',
    productId: '23567',
    categoryId: 'households',
    category: 'Household',
    remaining: 125,
    unit: 'Packet',
    turnover: 9000,
    increase: 1,
  },
]

export type ReportPeriod = 'monthly' | 'quarterly'
export interface TrendPoint {
  period: string
  revenue: number
  profit: number
}
// Approximate plotted values recovered from the reference curve, not transaction data.
export const reportTrend: TrendPoint[] = [
  { period: 'Sep', revenue: 24000, profit: 41000 },
  { period: 'Oct', revenue: 35000, profit: 33000 },
  { period: 'Nov', revenue: 27000, profit: 35000 },
  { period: 'Dec', revenue: 58000, profit: 48000 },
  { period: 'Jan', revenue: 51000, profit: 57000 },
  { period: 'Feb', revenue: 65000, profit: 49000 },
  { period: 'Mar', revenue: 41000, profit: 38000 },
]

export function reportTrendForPeriod(period: ReportPeriod): TrendPoint[] {
  if (period === 'monthly') return reportTrend
  const groups = [
    { period: 'Q3 (Sep)', rows: reportTrend.slice(0, 1) },
    { period: 'Q4', rows: reportTrend.slice(1, 4) },
    { period: 'Q1', rows: reportTrend.slice(4) },
  ]
  return groups.map((group) => ({
    period: group.period,
    revenue: group.rows.reduce((sum, row) => sum + row.revenue, 0),
    profit: group.rows.reduce((sum, row) => sum + row.profit, 0),
  }))
}

export function filterReportProducts(query: string, categoryId = 'all'): ReportProduct[] {
  const search = query.trim().toLocaleLowerCase()
  return reportProducts.filter(
    (product) =>
      (categoryId === 'all' || product.categoryId === categoryId) &&
      `${product.name} ${product.productId} ${product.category} ${product.categoryId}`
        .toLocaleLowerCase()
        .includes(search),
  )
}

export function filterReportCategories(query: string): ReportCategory[] {
  const search = query.trim().toLocaleLowerCase()
  if (!search) return reportCategories
  const matchingProducts = filterReportProducts(search)
  return reportCategories.filter(
    (category) =>
      category.name.toLocaleLowerCase().includes(search) ||
      matchingProducts.some((product) => product.categoryId === category.id),
  )
}

export function reportMoney(value: number) {
  return `$${value.toLocaleString('en-IN')}`
}
export function reportTrendCsv(period: ReportPeriod) {
  return toCsv([
    ['Period', 'Revenue (USD)', 'Profit (USD)'],
    ...reportTrendForPeriod(period).map((row) => [row.period, row.revenue, row.profit]),
  ])
}
export function reportProductsCsv(products: ReportProduct[]) {
  return toCsv([
    [
      'Product',
      'Product ID',
      'Category',
      'Remaining Quantity',
      'Unit',
      'Turnover (USD)',
      'Increase (%)',
    ],
    ...products.map((row) => [
      row.name,
      row.productId,
      row.category,
      row.remaining,
      row.unit,
      row.turnover,
      row.increase,
    ]),
  ])
}
export function reportCategoriesCsv(categories: ReportCategory[]) {
  return toCsv([
    ['Category', 'Turnover (USD)', 'Increase (%)'],
    ...categories.map((row) => [row.name, row.turnover, row.increase]),
  ])
}
