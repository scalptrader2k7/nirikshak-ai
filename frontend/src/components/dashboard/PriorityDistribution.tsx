"use client";

import React from "react";
import { StatisticsResponse } from "@/api/types";

interface PriorityDistributionProps {
  stats: StatisticsResponse;
}

export const PriorityDistribution: React.FC<PriorityDistributionProps> = ({ stats }) => {
  const distribution = stats.priority_distribution;
  const totalCases = stats.investigation_cases || 1; // avoid division by zero

  const priorityLevels = [
    {
      key: "CRITICAL",
      label: "Critical Priority",
      count: distribution.CRITICAL || 0,
      colorClass: "bg-red-700",
      textColorClass: "text-red-700",
      bgLightClass: "bg-red-50",
    },
    {
      key: "HIGH",
      label: "High Priority",
      count: distribution.HIGH || 0,
      colorClass: "bg-orange-600",
      textColorClass: "text-orange-600",
      bgLightClass: "bg-orange-50",
    },
    {
      key: "MEDIUM",
      label: "Medium Priority",
      count: distribution.MEDIUM || 0,
      colorClass: "bg-amber-500",
      textColorClass: "text-amber-700",
      bgLightClass: "bg-amber-50",
    },
    {
      key: "LOW",
      label: "Low Priority",
      count: distribution.LOW || 0,
      colorClass: "bg-slate-400",
      textColorClass: "text-slate-600",
      bgLightClass: "bg-slate-50",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Investigation Priority Distribution
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
          Aggregated count and proportion of records matching priority categories.
        </p>

        <div className="space-y-6" role="group" aria-label="Investigation Priority Distribution">
          {priorityLevels.map((level) => {
            const percentage = ((level.count / totalCases) * 100);
            const percentageString = stats.investigation_cases > 0 ? `${percentage.toFixed(1)}%` : "0.0%";

            return (
              <div key={level.key} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${level.colorClass}`} aria-hidden="true" />
                    <span className="font-semibold text-slate-800">{level.label}</span>
                  </div>
                  <div className="text-right space-x-1.5 font-mono text-slate-600">
                    <span className="font-bold text-slate-800">{level.count}</span>
                    <span className="text-slate-400">/</span>
                    <span>{percentageString}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${level.colorClass} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${stats.investigation_cases > 0 ? Math.max(percentage, 1.5) : 0}%` }}
                    role="progressbar"
                    aria-valuenow={level.count}
                    aria-valuemin={0}
                    aria-valuemax={stats.investigation_cases}
                    aria-label={`${level.label}: ${level.count} cases, ${percentageString}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-mono">
        <span>Denominator: {stats.investigation_cases} Flagged Cases</span>
        <span>Scale: 0 - {stats.investigation_cases}</span>
      </div>
    </div>
  );
};

export default PriorityDistribution;
