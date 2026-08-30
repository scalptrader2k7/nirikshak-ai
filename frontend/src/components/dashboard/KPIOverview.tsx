"use client";

import React from "react";
import { Database, AlertTriangle, AlertCircle, ShieldAlert, BarChart3 } from "lucide-react";
import { StatisticsResponse } from "@/api/types";

interface KPIOverviewProps {
  stats: StatisticsResponse;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ stats }) => {
  const kpis = [
    {
      label: "Total Records",
      value: stats.total_records,
      description: "Total database records evaluated",
      icon: Database,
      textColor: "text-slate-900",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      iconColor: "text-slate-500",
    },
    {
      label: "Investigation Cases",
      value: stats.investigation_cases,
      description: "Records requiring review based on indicators",
      icon: ShieldAlert,
      textColor: "text-slate-900",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      iconColor: "text-slate-600",
    },
    {
      label: "High Priority Cases",
      value: stats.priority_distribution.HIGH || 0,
      description: "Cases with high-priority indicators",
      icon: AlertTriangle,
      textColor: "text-orange-700",
      bgColor: "bg-orange-50/50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
    },
    {
      label: "Medium Priority Cases",
      value: stats.priority_distribution.MEDIUM || 0,
      description: "Cases with medium-priority indicators",
      icon: AlertCircle,
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
    },
    {
      label: "Avg. Investigation Score",
      value: stats.score.mean.toFixed(1),
      description: "Mean priority score of all records",
      icon: BarChart3,
      textColor: "text-slate-900",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      iconColor: "text-slate-500",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Platform Key Performance Indicators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`bg-white border ${kpi.borderColor} p-5 rounded-lg shadow-sm flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-slate-500 max-w-[80%] leading-tight">
                  {kpi.label}
                </span>
                <div className={`p-1.5 ${kpi.bgColor} rounded border border-slate-100`}>
                  <Icon className={`h-4 w-4 ${kpi.iconColor}`} aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-bold tracking-tight ${kpi.textColor} font-mono tabular-nums`}>
                  {kpi.value}
                </span>
                <span className="text-xs text-slate-400 block mt-1 leading-snug">
                  {kpi.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KPIOverview;
