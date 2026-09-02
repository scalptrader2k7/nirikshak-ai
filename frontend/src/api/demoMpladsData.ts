export type UtilizationTier = "HIGH" | "GOOD" | "MODERATE" | "LOW";

export interface StateMpladsRecord {
    state: string;
    totalWorks: number;
    allocatedCr: number;
    expenditureCr: number;
    utilizationPct: number;
    utilizationTier: UtilizationTier;
    topMP: string;
    topConstituency: string;
    completedWorks: number;
    ongoingWorks: number;
    underReviewWorks: number;
    pendingWorks: number;
}

export interface SectorUtilizationRecord {
    sector: string;
    allocatedCr: number;
    expenditureCr: number;
    utilizationPct: number;
    worksCount: number;
    flaggedWorks: number;
}

export interface PeriodUtilizationRecord {
    period: string;
    allocatedCr: number;
    expenditureCr: number;
    utilizationPct: number;
}

// 28 Indian States & UTs dataset for interactive demonstration
export const DEMO_STATES_DATA: StateMpladsRecord[] = [
    {
        state: "Gujarat",
        totalWorks: 156,
        allocatedCr: 88.4,
        expenditureCr: 81.6,
        utilizationPct: 92.3,
        utilizationTier: "HIGH",
        topMP: "Shri C. R. Patil",
        topConstituency: "Navsari",
        completedWorks: 124,
        ongoingWorks: 22,
        underReviewWorks: 7,
        pendingWorks: 3,
    },
    {
        state: "Tamil Nadu",
        totalWorks: 168,
        allocatedCr: 92.0,
        expenditureCr: 82.8,
        utilizationPct: 90.0,
        utilizationTier: "HIGH",
        topMP: "Thiru Dayanidhi Maran",
        topConstituency: "Chennai Central",
        completedWorks: 130,
        ongoingWorks: 26,
        underReviewWorks: 9,
        pendingWorks: 3,
    },
    {
        state: "Nagaland",
        totalWorks: 42,
        allocatedCr: 24.5,
        expenditureCr: 21.8,
        utilizationPct: 89.0,
        utilizationTier: "HIGH",
        topMP: "Shri Tokheho Yepthomi",
        topConstituency: "Nagaland",
        completedWorks: 34,
        ongoingWorks: 5,
        underReviewWorks: 2,
        pendingWorks: 1,
    },
    {
        state: "Andhra Pradesh",
        totalWorks: 134,
        allocatedCr: 76.5,
        expenditureCr: 66.8,
        utilizationPct: 87.3,
        utilizationTier: "HIGH",
        topMP: "Shri G. M. Harish",
        topConstituency: "Amalapuram",
        completedWorks: 98,
        ongoingWorks: 24,
        underReviewWorks: 8,
        pendingWorks: 4,
    },
    {
        state: "Uttar Pradesh",
        totalWorks: 184,
        allocatedCr: 95.4,
        expenditureCr: 78.2,
        utilizationPct: 82.0,
        utilizationTier: "GOOD",
        topMP: "Hon. Representative (Varanasi)",
        topConstituency: "Varanasi",
        completedWorks: 112,
        ongoingWorks: 44,
        underReviewWorks: 22,
        pendingWorks: 6,
    },
    {
        state: "Maharashtra",
        totalWorks: 142,
        allocatedCr: 73.8,
        expenditureCr: 59.8,
        utilizationPct: 81.0,
        utilizationTier: "GOOD",
        topMP: "Hon. Representative (Pune)",
        topConstituency: "Pune",
        completedWorks: 92,
        ongoingWorks: 32,
        underReviewWorks: 14,
        pendingWorks: 4,
    },
    {
        state: "Karnataka",
        totalWorks: 98,
        allocatedCr: 50.4,
        expenditureCr: 39.3,
        utilizationPct: 78.0,
        utilizationTier: "GOOD",
        topMP: "Hon. Representative (Mysuru)",
        topConstituency: "Mysuru",
        completedWorks: 68,
        ongoingWorks: 19,
        underReviewWorks: 8,
        pendingWorks: 3,
    },
    {
        state: "Rajasthan",
        totalWorks: 118,
        allocatedCr: 61.2,
        expenditureCr: 45.3,
        utilizationPct: 74.0,
        utilizationTier: "GOOD",
        topMP: "Hon. Representative (Jaipur Rural)",
        topConstituency: "Jaipur Rural",
        completedWorks: 74,
        ongoingWorks: 28,
        underReviewWorks: 12,
        pendingWorks: 4,
    },
    {
        state: "Kerala",
        totalWorks: 86,
        allocatedCr: 46.2,
        expenditureCr: 33.7,
        utilizationPct: 73.0,
        utilizationTier: "GOOD",
        topMP: "Dr. Shashi Tharoor",
        topConstituency: "Thiruvananthapuram",
        completedWorks: 58,
        ongoingWorks: 18,
        underReviewWorks: 7,
        pendingWorks: 3,
    },
    {
        state: "Telangana",
        totalWorks: 92,
        allocatedCr: 48.0,
        expenditureCr: 34.6,
        utilizationPct: 72.0,
        utilizationTier: "GOOD",
        topMP: "Shri Asaduddin Owaisi",
        topConstituency: "Hyderabad",
        completedWorks: 60,
        ongoingWorks: 21,
        underReviewWorks: 8,
        pendingWorks: 3,
    },
    {
        state: "Madhya Pradesh",
        totalWorks: 96,
        allocatedCr: 49.8,
        expenditureCr: 33.4,
        utilizationPct: 67.0,
        utilizationTier: "MODERATE",
        topMP: "Hon. Representative (Indore)",
        topConstituency: "Indore",
        completedWorks: 56,
        ongoingWorks: 24,
        underReviewWorks: 11,
        pendingWorks: 5,
    },
    {
        state: "Bihar",
        totalWorks: 104,
        allocatedCr: 54.0,
        expenditureCr: 35.1,
        utilizationPct: 65.0,
        utilizationTier: "MODERATE",
        topMP: "Hon. Representative (Patna Sahib)",
        topConstituency: "Patna Sahib",
        completedWorks: 58,
        ongoingWorks: 28,
        underReviewWorks: 14,
        pendingWorks: 4,
    },
    {
        state: "West Bengal",
        totalWorks: 112,
        allocatedCr: 58.0,
        expenditureCr: 36.5,
        utilizationPct: 63.0,
        utilizationTier: "MODERATE",
        topMP: "Smt. Mahua Moitra",
        topConstituency: "Krishnanagar",
        completedWorks: 62,
        ongoingWorks: 31,
        underReviewWorks: 15,
        pendingWorks: 4,
    },
    {
        state: "Odisha",
        totalWorks: 84,
        allocatedCr: 42.0,
        expenditureCr: 25.6,
        utilizationPct: 61.0,
        utilizationTier: "MODERATE",
        topMP: "Shri Pinaki Misra",
        topConstituency: "Puri",
        completedWorks: 46,
        ongoingWorks: 24,
        underReviewWorks: 10,
        pendingWorks: 4,
    },
    {
        state: "Punjab",
        totalWorks: 76,
        allocatedCr: 38.5,
        expenditureCr: 21.6,
        utilizationPct: 56.0,
        utilizationTier: "MODERATE",
        topMP: "Shri Gurjeet Singh Aujla",
        topConstituency: "Amritsar",
        completedWorks: 38,
        ongoingWorks: 22,
        underReviewWorks: 11,
        pendingWorks: 5,
    },
    {
        state: "Haryana",
        totalWorks: 68,
        allocatedCr: 34.0,
        expenditureCr: 18.7,
        utilizationPct: 55.0,
        utilizationTier: "MODERATE",
        topMP: "Shri Deepender Singh Hooda",
        topConstituency: "Rohtak",
        completedWorks: 32,
        ongoingWorks: 21,
        underReviewWorks: 10,
        pendingWorks: 5,
    },
    {
        state: "Assam",
        totalWorks: 72,
        allocatedCr: 36.0,
        expenditureCr: 19.4,
        utilizationPct: 54.0,
        utilizationTier: "MODERATE",
        topMP: "Shri Gaurav Gogoi",
        topConstituency: "Jorhat",
        completedWorks: 34,
        ongoingWorks: 23,
        underReviewWorks: 11,
        pendingWorks: 4,
    },
    {
        state: "Jharkhand",
        totalWorks: 64,
        allocatedCr: 32.0,
        expenditureCr: 15.4,
        utilizationPct: 48.0,
        utilizationTier: "LOW",
        topMP: "Shri Nishikant Dubey",
        topConstituency: "Godda",
        completedWorks: 26,
        ongoingWorks: 22,
        underReviewWorks: 12,
        pendingWorks: 4,
    },
    {
        state: "Chhattisgarh",
        totalWorks: 58,
        allocatedCr: 29.0,
        expenditureCr: 13.3,
        utilizationPct: 46.0,
        utilizationTier: "LOW",
        topMP: "Shri Brijmohan Agrawal",
        topConstituency: "Raipur",
        completedWorks: 22,
        ongoingWorks: 20,
        underReviewWorks: 12,
        pendingWorks: 4,
    },
    {
        state: "Uttarakhand",
        totalWorks: 44,
        allocatedCr: 22.0,
        expenditureCr: 9.9,
        utilizationPct: 45.0,
        utilizationTier: "LOW",
        topMP: "Shri Anil Baluni",
        topConstituency: "Garhwal",
        completedWorks: 16,
        ongoingWorks: 16,
        underReviewWorks: 9,
        pendingWorks: 3,
    },
    {
        state: "Himachal Pradesh",
        totalWorks: 38,
        allocatedCr: 19.0,
        expenditureCr: 8.2,
        utilizationPct: 43.0,
        utilizationTier: "LOW",
        topMP: "Shri Anurag Singh Thakur",
        topConstituency: "Hamirpur",
        completedWorks: 14,
        ongoingWorks: 14,
        underReviewWorks: 7,
        pendingWorks: 3,
    },
    {
        state: "Jammu & Kashmir",
        totalWorks: 36,
        allocatedCr: 18.0,
        expenditureCr: 7.2,
        utilizationPct: 40.0,
        utilizationTier: "LOW",
        topMP: "Dr. Jitendra Singh",
        topConstituency: "Udhampur",
        completedWorks: 12,
        ongoingWorks: 13,
        underReviewWorks: 8,
        pendingWorks: 3,
    },
];

export const DEMO_SECTOR_DATA: SectorUtilizationRecord[] = [
    {
        sector: "Roads & Pathways",
        allocatedCr: 128.5,
        expenditureCr: 98.4,
        utilizationPct: 76.6,
        worksCount: 248,
        flaggedWorks: 58,
    },
    {
        sector: "Community Infrastructure",
        allocatedCr: 96.5,
        expenditureCr: 72.8,
        utilizationPct: 75.4,
        worksCount: 186,
        flaggedWorks: 46,
    },
    {
        sector: "Water Supply & Sanitation",
        allocatedCr: 74.6,
        expenditureCr: 55.2,
        utilizationPct: 74.0,
        worksCount: 144,
        flaggedWorks: 38,
    },
    {
        sector: "Public Lighting & Solar",
        allocatedCr: 50.8,
        expenditureCr: 39.6,
        utilizationPct: 78.0,
        worksCount: 98,
        flaggedWorks: 26,
    },
    {
        sector: "Educational Facilities",
        allocatedCr: 34.2,
        expenditureCr: 24.8,
        utilizationPct: 72.5,
        worksCount: 66,
        flaggedWorks: 17,
    },
];

export const DEMO_PERIOD_DATA: PeriodUtilizationRecord[] = [
    { period: "FY 2020-21", allocatedCr: 68.0, expenditureCr: 59.8, utilizationPct: 88.0 },
    { period: "FY 2021-22", allocatedCr: 74.5, expenditureCr: 62.6, utilizationPct: 84.0 },
    { period: "FY 2022-23", allocatedCr: 82.0, expenditureCr: 66.4, utilizationPct: 81.0 },
    { period: "FY 2023-24", allocatedCr: 88.5, expenditureCr: 65.5, utilizationPct: 74.0 },
    { period: "FY 2024-25 (Current)", allocatedCr: 71.6, expenditureCr: 36.5, utilizationPct: 51.0 },
];

// Helper functions for interactive filtering
export function filterStatesByTier(tier: UtilizationTier | "ALL" | "TOP10"): StateMpladsRecord[] {
    if (tier === "TOP10") {
        return [...DEMO_STATES_DATA]
            .sort((a, b) => b.utilizationPct - a.utilizationPct)
            .slice(0, 10);
    }
    if (tier === "ALL") {
        return DEMO_STATES_DATA;
    }
    return DEMO_STATES_DATA.filter((s) => s.utilizationTier === tier);
}

export function searchMpladsEntities(query: string) {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    return DEMO_STATES_DATA.filter(
        (item) =>
            item.state.toLowerCase().includes(q) ||
            item.topMP.toLowerCase().includes(q) ||
            item.topConstituency.toLowerCase().includes(q)
    );
}
