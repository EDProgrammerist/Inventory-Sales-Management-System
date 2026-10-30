import { formatMoney } from './currency.ts'
import { toCsv } from './csv.ts'

// Empty report state; no sales or purchase transaction source is connected.
export const reportOverview = {
  totalProfit: 0,
  revenue: 0,
  sales: 0,
  netPurchase: 0,
  netSales: 0,
  momProfit: 0,
  yoyProfit: 0,
}

export interface ReportCategory {
  id: string
  name: string
  turnover: number
  increase: number
}
export const reportCategories: ReportCategory[] = []

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
export const reportProducts: ReportProduct[] = []

export type ReportPeriod = 'monthly' | 'quarterly'
export interface TrendPoint {
  period: string
  revenue: number
  profit: number
}
// Keep the chart frame visible without inventing transaction values.
export const reportTrend: TrendPoint[] = [
  { period: 'Sep', revenue: 0, profit: 0 },
  { period: 'Oct', revenue: 0, profit: 0 },
  { period: 'Nov', revenue: 0, profit: 0 },
  { period: 'Dec', revenue: 0, profit: 0 },
  { period: 'Jan', revenue: 0, profit: 0 },
  { period: 'Feb', revenue: 0, profit: 0 },
  { period: 'Mar', revenue: 0, profit: 0 },
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
  return formatMoney(value)
}
export function reportTrendCsv(period: ReportPeriod) {
  return toCsv([
    ['Period', 'Revenue (PHP)', 'Profit (PHP)'],
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
      'Turnover (PHP)',
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
    ['Category', 'Turnover (PHP)', 'Increase (%)'],
    ...categories.map((row) => [row.name, row.turnover, row.increase]),
  ])
}
