import { activityForPeriod, type ChartPeriod } from '@/data/dashboard-demo'
import { downloadCsv } from '@/lib/download'
import { toCsv } from '@/data/csv'

export function activityCsv(period: ChartPeriod): string {
  return toCsv([
    ['Period', 'Purchase (USD)', 'Sales (USD)'],
    ...activityForPeriod(period).map((row) => [row.month, row.purchase, row.sales]),
  ])
}

export function downloadActivityReport(period: ChartPeriod) {
  downloadCsv(activityCsv(period), `kanban-sample-${period}-report.csv`)
}
