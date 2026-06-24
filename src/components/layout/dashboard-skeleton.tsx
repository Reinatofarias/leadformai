import React from 'react'

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2.5 flex-1 mr-4">
          <div className="h-3 w-2/5 bg-slate-200 rounded-md"></div>
          <div className="h-7 w-3/5 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="h-11 w-11 rounded-xl bg-slate-100 shrink-0"></div>
      </div>
    </div>
  )
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  )
}

export function FunnelCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100"></div>
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
            <div className="h-3 w-16 bg-slate-100 rounded-md"></div>
          </div>
        </div>
        <div className="h-5 w-14 bg-slate-100 rounded-full"></div>
      </div>
      <div className="h-3 w-44 bg-slate-100 rounded-md mb-5"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-slate-100 rounded-lg flex-1"></div>
        <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
  )
}

export function FunnelGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <FunnelCardSkeleton />
      <FunnelCardSkeleton />
      <FunnelCardSkeleton />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse">
      <div className="space-y-2 mb-6">
        <div className="h-4.5 w-1/4 bg-slate-200 rounded-md"></div>
        <div className="h-3 w-2/5 bg-slate-100 rounded-md"></div>
      </div>
      <div className="h-[260px] w-full bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between p-4">
        <div className="flex justify-between items-end h-[180px] w-full px-2 gap-4">
          <div className="bg-slate-200/50 w-full rounded-t-lg h-[40%]"></div>
          <div className="bg-slate-200/50 w-full rounded-t-lg h-[75%]"></div>
          <div className="bg-slate-200/50 w-full rounded-t-lg h-[90%]"></div>
          <div className="bg-slate-200/50 w-full rounded-t-lg h-[50%]"></div>
        </div>
        <div className="border-t border-slate-100 pt-3 flex justify-between">
          <div className="h-2.5 w-12 bg-slate-100 rounded"></div>
          <div className="h-2.5 w-12 bg-slate-100 rounded"></div>
          <div className="h-2.5 w-12 bg-slate-100 rounded"></div>
          <div className="h-2.5 w-12 bg-slate-100 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      <MetricsGridSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}
