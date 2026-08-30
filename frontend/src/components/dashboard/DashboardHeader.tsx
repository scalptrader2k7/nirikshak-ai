"use client";

import React from "react";
import { Scale } from "lucide-react";

export const DashboardHeader: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Investigation Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl leading-relaxed">
          Review and prioritize MPLADS records using explainable risk indicators.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex gap-3 text-xs text-slate-700 leading-relaxed shadow-sm">
        <Scale className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-900 block">Oversight Notice & Disclaimer</span>
          <p>
            Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
