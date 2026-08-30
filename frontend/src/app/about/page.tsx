"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Platform Methodology</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Technical specifications, MoSPI guidelines context, and platform operations logic.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] p-8 rounded-xl shadow-sm flex flex-col items-center justify-center text-center py-20">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-4">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Methodology & About</h2>
        <p className="text-sm text-[#64748B] mt-2 max-w-md">
          Platform documentation outlining raw cleaning, feature engineering, and the z-score/similarity engine math will be published here.
        </p>
      </div>
    </div>
  );
}
