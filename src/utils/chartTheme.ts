export interface ChartTheme {
  axisColor: string
  gridColor: string
  tooltipBackground: string
  tooltipBorder: string
  tooltipText: string
}

export function getChartTheme(isDarkMode: boolean): ChartTheme {
  return isDarkMode
    ? {
        axisColor: '#9ca3af',
        gridColor: '#2e303a',
        tooltipBackground: '#1f2028',
        tooltipBorder: '#2e303a',
        tooltipText: '#e5e7eb',
      }
    : {
        axisColor: '#6b7280',
        gridColor: '#e2e4e8',
        tooltipBackground: '#f4f5f7',
        tooltipBorder: '#e2e4e8',
        tooltipText: '#1f2328',
      }
}
