'use client'

import { useMemo } from 'react'

interface DataPoint {
  date: string
  amount: number
}

interface LineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  className?: string
}

export function LineChart({ data, width = 800, height = 300, className = '' }: LineChartProps) {
  const { chartData, maxValue, minValue, xScale, yScale } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], maxValue: 0, minValue: 0, xScale: 0, yScale: 0 }
    }

    const amounts = data.map(d => d.amount)
    const maxVal = Math.max(...amounts)
    const minVal = Math.min(...amounts)
    const padding = 40
    
    // Create scales
    const xScale = (width - 2 * padding) / (data.length - 1)
    const yScale = (height - 2 * padding) / (maxVal - minVal || 1)
    
    return {
      chartData: data,
      maxValue: maxVal,
      minValue: minVal,
      xScale,
      yScale
    }
  }, [data, width, height])

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} style={{ width, height }}>
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  const padding = 40
  const pathData = chartData
    .map((point, index) => {
      const x = padding + index * xScale
      const y = height - padding - (point.amount - minValue) * yScale
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div className={`bg-card rounded-lg border p-4 ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" opacity="0.3"/>
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const value = minValue + (maxValue - minValue) * ratio
          const y = height - padding - ratio * (height - 2 * padding)
          return (
            <g key={ratio}>
              <line 
                x1={padding - 5} 
                y1={y} 
                x2={padding} 
                y2={y} 
                stroke="hsl(var(--muted-foreground))" 
              />
              <text 
                x={padding - 10} 
                y={y + 4} 
                textAnchor="end" 
                fontSize="12" 
                fill="hsl(var(--muted-foreground))"
              >
                ${value.toFixed(0)}
              </text>
            </g>
          )
        })}
        
        {/* X-axis labels */}
        {chartData.map((point, index) => {
          if (index % Math.ceil(chartData.length / 8) === 0) {
            const x = padding + index * xScale
            const date = new Date(point.date)
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return (
              <g key={index}>
                <line 
                  x1={x} 
                  y1={height - padding} 
                  x2={x} 
                  y2={height - padding + 5} 
                  stroke="hsl(var(--muted-foreground))" 
                />
                <text 
                  x={x} 
                  y={height - padding + 20} 
                  textAnchor="middle" 
                  fontSize="12" 
                  fill="hsl(var(--muted-foreground))"
                >
                  {label}
                </text>
              </g>
            )
          }
          return null
        })}
        
        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {chartData.map((point, index) => {
          const x = padding + index * xScale
          const y = height - padding - (point.amount - minValue) * yScale
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="hsl(var(--primary))"
              className="hover:r-4 transition-all cursor-pointer"
            >
              <title>{`${point.date}: $${point.amount.toFixed(2)}`}</title>
            </circle>
          )
        })}
      </svg>
    </div>
  )
} 