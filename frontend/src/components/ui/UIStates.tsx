import React from "react";
import { AlertCircle, FileX, RefreshCw } from "lucide-react";

interface LoadingSkeletonProps {
  rows?: number;
  heightClass?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  rows = 5, 
  heightClass = "h-12" 
}) => {
  return (
    <div className="w-full space-y-4 animate-pulse" role="status" aria-label="Loading content...">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className={`flex-1 ${heightClass} bg-slate-200 dark:bg-slate-800 rounded-md`} />
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No investigation records found",
  description = "No results match the selected filter criteria. Try resetting filters or adjusting search queries.",
  onResetFilters
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-zinc-950">
      <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-full text-slate-400 dark:text-slate-600 mb-4">
        <FileX className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-md">{description}</p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="mt-5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Connection Failure",
  errorMessage = "Unable to connect to the Nirikshak AI backend service. Please check if the server is running.",
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-red-200 dark:border-red-950/30 rounded-xl bg-red-50/30 dark:bg-red-950/10">
      <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full text-red-600 dark:text-red-400 mb-4">
        <AlertCircle className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">{title}</h3>
      <div className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-md font-medium">
        {errorMessage}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-md hover:bg-red-800 transition"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
export default LoadingSkeleton;
