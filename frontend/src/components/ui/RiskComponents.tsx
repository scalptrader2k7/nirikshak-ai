import React from "react";
import { 
  AlertOctagon, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Coins, 
  Copy, 
  FileWarning, 
  Activity 
} from "lucide-react";

interface RiskBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  showLabel?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showLabel = true }) => {
  let bgColor = "";
  let textColor = "";
  let borderColor = "";
  let Icon = Info;
  let accessibleText = "";
  let labelText: string = level;

  switch (level.toUpperCase()) {
    case "CRITICAL":
      bgColor = "bg-red-50 dark:bg-red-950/30";
      textColor = "text-red-700 dark:text-red-400";
      borderColor = "border-red-200 dark:border-red-900/50";
      Icon = AlertOctagon;
      accessibleText = "Critical investigation priority";
      labelText = "Critical";
      break;
    case "HIGH":
      bgColor = "bg-orange-50 dark:bg-orange-950/30";
      textColor = "text-orange-700 dark:text-orange-400";
      borderColor = "border-orange-200 dark:border-orange-900/50";
      Icon = AlertTriangle;
      accessibleText = "High investigation priority";
      labelText = "High";
      break;
    case "MEDIUM":
      bgColor = "bg-amber-50 dark:bg-amber-950/30";
      textColor = "text-amber-700 dark:text-amber-400";
      borderColor = "border-amber-200 dark:border-amber-900/50";
      Icon = AlertCircle;
      accessibleText = "Medium investigation priority";
      labelText = "Medium";
      break;
    case "LOW":
    default:
      bgColor = "bg-slate-50 dark:bg-slate-800/40";
      textColor = "text-slate-700 dark:text-slate-400";
      borderColor = "border-slate-200 dark:border-slate-700/50";
      Icon = Info;
      accessibleText = "Low investigation priority";
      labelText = "Low";
      break;
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${bgColor} ${textColor} ${borderColor}`}
      title={accessibleText}
      role="status"
      aria-label={accessibleText}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {showLabel && <span>{labelText}</span>}
    </span>
  );
};

interface DetectorBadgeProps {
  detector: "cost" | "exact_duplicate" | "near_duplicate" | "pattern" | string;
}

export const DetectorBadge: React.FC<DetectorBadgeProps> = ({ detector }) => {
  let Icon = Info;
  let label = detector;
  let styleClass = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  switch (detector.toLowerCase()) {
    case "cost":
      Icon = Coins;
      label = "Cost Anomaly";
      styleClass = "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30";
      break;
    case "exact_duplicate":
      Icon = Copy;
      label = "Repeated Record";
      styleClass = "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30";
      break;
    case "near_duplicate":
      Icon = FileWarning;
      label = "Suspicious Similarity";
      styleClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      break;
    case "pattern":
      Icon = Activity;
      label = "Temporal Pattern";
      styleClass = "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${styleClass}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

interface SeverityIndicatorProps {
  severity: "low" | "medium" | "high" | "critical" | string;
  showText?: boolean;
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({ severity, showText = true }) => {
  let dotColor = "bg-slate-400";
  let accessibleText = `Severity: ${severity}`;
  
  switch (severity.toLowerCase()) {
    case "critical":
      dotColor = "bg-red-700";
      break;
    case "high":
      dotColor = "bg-orange-600";
      break;
    case "medium":
      dotColor = "bg-amber-500";
      break;
    case "low":
      dotColor = "bg-slate-500";
      break;
  }

  return (
    <span className="inline-flex items-center gap-1.5" title={accessibleText}>
      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden="true" />
      {showText && <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{severity}</span>}
    </span>
  );
};
export default RiskBadge;
