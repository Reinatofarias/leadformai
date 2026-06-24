'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'

interface ClassificationChartProps {
  classifications: { name: string; value: number }[]
  colors: Record<string, string>
  leadsCount: number
}

export function ClassificationChart({ classifications, colors, leadsCount }: ClassificationChartProps) {
  return (
    <div className="h-[300px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={classifications}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {classifications.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[entry.name] || colors['Sem Classificação']} 
              />
            ))}
          </Pie>
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0]
                const value = item.value as number
                const name = item.name as string
                const percentage = leadsCount > 0 ? Math.round((value / leadsCount) * 100) : 0
                
                const label = name === 'VERY_HOT' ? 'Muito Quente' :
                              name === 'HOT' ? 'Quente' :
                              name === 'WARM' ? 'Morno' :
                              name === 'COLD' ? 'Frio' : name

                return (
                  <div className="bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 border border-slate-800 shadow-xl rounded-xl text-white">
                    <p className="font-bold text-xs">{label}</p>
                    <p className="text-[11px] text-indigo-400 font-semibold mt-1">
                      {value} leads ({percentage}%)
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
