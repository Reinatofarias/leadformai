'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

interface DropoffChartProps {
  data: { name: string; title: string; views: number }[]
}

export function DropoffChart({ data }: DropoffChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            cursor={{ fill: '#F8FAFC' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload
                return (
                  <div className="bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 border border-slate-800 shadow-xl rounded-xl text-white">
                    <p className="font-bold text-xs">{item.name}: {item.title}</p>
                    <p className="text-[11px] text-indigo-400 font-semibold mt-1">{item.views} visualizações</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="views" fill="#6366F1" radius={[8, 8, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
