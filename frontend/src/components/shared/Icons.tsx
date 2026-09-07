import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number;
    className?: string;
}

export const Menu: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const X: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

export const Globe: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" />
    </svg>
);

export const LayoutDashboard: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
);

export const ShieldAlert: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M12 3 20 6v5.5c0 4.9-3.2 8.5-8 9.8-4.8-1.3-8-4.9-8-9.8V6l8-3Z" />
        <path d="M12 8v4M12 16h.01" />
    </svg>
);

export const FolderSearch: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M10 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v2.5" />
        <circle cx="17" cy="17" r="3" />
        <path d="m21 21-1.9-1.9" />
    </svg>
);

export const BarChart3: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
    </svg>
);

export const FileText: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
);

export const Upload: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
);

export const ClipboardCheck: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="m9 14 2 2 4-4" />
    </svg>
);

export const Database: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
);

export const ChevronLeft: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m15 18-6-6 6-6" />
    </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export const LogIn: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
);

export const Shield: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M12 3 20 6v5.5c0 4.9-3.2 8.5-8 9.8-4.8-1.3-8-4.9-8-9.8V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export const User: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.1 3.1-5 7-5s6.2 1.9 7 5" />
    </svg>
);

export const Lock: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M12 14v2" />
    </svg>
);

export const Key: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <circle cx="8.5" cy="15.5" r="3.5" />
        <path d="m11 13 8-8M16 6l2 2M14 8l2 2" />
    </svg>
);

export const Eye: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.5" />
    </svg>
);

export const EyeOff: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m3 3 18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M9.9 5.2A10.8 10.8 0 0 1 12 5c6.1 0 9.5 7 9.5 7a16 16 0 0 1-3.2 3.8M6.3 6.4C3.8 8.1 2.5 12 2.5 12s3.4 7 9.5 7c1.4 0 2.7-.3 3.8-.8" />
    </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export const Info: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
    </svg>
);

export const Check: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m5 12 4 4L19 6" />
    </svg>
);

export const Activity: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M3 12h4l2.5-6 5 12 2.5-6H21" />
    </svg>
);

export const AlertTriangle: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
);

export const RefreshCw: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);

export const Clock: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export const ArrowLeft: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m12 19-7-7 7-7M19 12H5" />
    </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export const Layers: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

export const Download: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
);

export const ChevronsLeft: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
    </svg>
);

export const ChevronsRight: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
    </svg>
);

export const ChevronDown: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export const ExternalLink: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
    </svg>
);

export const Filter: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export const ArrowUpDown: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
    </svg>
);

export const ArrowUp: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m5 12 7-7 7 7M12 19V5" />
    </svg>
);

export const ArrowDown: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="m19 12-7 7-7-7M12 5v14" />
    </svg>
);

export const RotateCcw: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
);

export const Search: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

export const Printer: React.FC<IconProps> = ({ size = 20, strokeWidth = 2, className = "", ...props }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} {...props}>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
    </svg>
);




