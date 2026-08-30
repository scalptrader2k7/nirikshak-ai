"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Platform Analytics</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Oversight charts and metrics breakdowns by states, constituencies, and temporal recommend counts.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] p-8 rounded-xl shadow-sm flex flex-col items-center justify-center text-center py-20">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-4">
          <BarChart3 className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Analytics Under Construction</h2>
        <p className="text-sm text-[#64748B] mt-2 max-w-md">
          The foundation is ready. In Step 5D, interactive statistical spending charts and burst timelines will be integrated.
        </p>
      </div>
    </div>
  );
}
