"use client";

import React from "react";
import { Coins, Copy, FileWarning, Activity } from "lucide-react";
import { StatisticsResponse } from "@/api/types";

interface DetectorDistributionProps {
  stats: StatisticsResponse;
}

export const DetectorDistribution: React.FC<DetectorDistributionProps> = ({ stats }) => {
  const distribution = stats.detector_distribution;

  const detectors = [
    {
      key: "near_duplicate",
      label: "Near Duplicate",
      count: distribution.near_duplicate || 0,
      icon: FileWarning,
      description: "Detects highly similar project descriptions and localized clusters",
      colorClass: "text-rose-600 bg-rose-50 border-rose-100",
      progressColor: "bg-rose-500",
    },
    {
      key: "cost",
      label: "Cost Anomaly",
      count: distribution.cost || 0,
      icon: Coins,
      description: "Identifies projects with unusually high budget allocations relative to category medians",
      colorClass: "text-cyan-600 bg-cyan-50 border-cyan-100",
      progressColor: "bg-cyan-500",
    },
    {
      key: "exact_duplicate",
      label: "Exact Duplicate",
      count: distribution.exact_duplicate || 0,
      icon: Copy,
      description: "Identifies identical records repeated multiple times in the source dataset",
      colorClass: "text-indigo-600 bg-indigo-50 border-indigo-100",
      progressColor: "bg-indigo-500",
    },
    {
      key: "pattern",
      label: "Temporal Pattern",
      count: distribution.pattern || 0,
      icon: Activity,
      description: "Identifies suspicious temporal clusters or regular recommendation dates",
      colorClass: "text-teal-600 bg-teal-50 border-teal-100",
      progressColor: "bg-teal-500",
    },
  ];

  // Calculate sum of triggers to show relative proportion in progress bars
  const totalTriggers = detectors.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Detector Signal Analysis
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
          Distribution of specific risk models driving the overall case flags.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {detectors.map((det) => {
            const Icon = det.icon;
            const percentage = ((det.count / totalTriggers) * 100);

            return (
              <div
                key={det.key}
                className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">{det.label}</span>
                    <div className={`p-1.5 rounded border ${det.colorClass}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                    {det.description}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                      {det.count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {percentage.toFixed(0)}% of triggers
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-1">
                    <div
                      className={`${det.progressColor} h-1 rounded-full`}
                      style={{ width: `${totalTriggers > 1 ? percentage : 0}%` }}
                      role="presentation"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-mono">
        <span>Total Detector Triggers: {totalTriggers}</span>
      </div>
    </div>
  );
};

export default DetectorDistribution;
