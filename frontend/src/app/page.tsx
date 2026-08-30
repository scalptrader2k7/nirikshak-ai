"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import apiClient from "@/api/client";
import { StatisticsResponse } from "@/api/types";
import { LoadingSkeleton, ErrorState } from "@/components/ui/UIStates";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPIOverview from "@/components/dashboard/KPIOverview";
import PriorityDistribution from "@/components/dashboard/PriorityDistribution";
import DetectorDistribution from "@/components/dashboard/DetectorDistribution";

export default function Dashboard() {
  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = () => {
    apiClient.getStatistics()
      .then(res => {
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to reach the Nirikshak AI API backend.");
        setLoading(false);
      });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadStats();
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto" role="status" aria-label="Loading investigation statistics…">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-24 w-full bg-slate-100 rounded-lg animate-pulse flex items-center justify-center text-sm font-semibold text-slate-500">
          Loading investigation statistics…
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-80 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <ErrorState
          title="Unable to load investigation statistics."
          errorMessage={error || "No response received from the Nirikshak API."}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Dashboard Header (with Title, Supporting Text and Notice) */}
      <DashboardHeader />

      {/* 2. KPI Overview Section */}
      <KPIOverview stats={stats} />

      {/* 3. Two-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <PriorityDistribution stats={stats} />

        {/* Detector Distribution */}
        <DetectorDistribution stats={stats} />
      </div>

      {/* 4. Investigation Queue Placeholder Entry Point */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-slate-600" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-900">
                Investigation Queue
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Review individual flagged records, evidence and related project relationships.
            </p>
          </div>
          <div>
            <Link
              href="/investigations"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition rounded-md shadow-sm w-full md:w-auto"
            >
              <span>View investigations</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
