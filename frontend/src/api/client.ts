import type {
    HealthResponse,
    CaseListResponse,
    SingleCaseResponse,
    CaseDetailResponse,
    StatisticsResponse,
    Filters,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = "An error occurred while communicating with the Nirikshak server.";
        try {
            const errorJson = await response.json();
            if (errorJson && errorJson.detail) {
                errorMessage =
                    typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
            }
        } catch {
            // JSON parsing failed, fall back to the default message above.
        }
        throw new ApiError(errorMessage, response.status);
    }
    return response.json() as Promise<T>;
}

// Shared across every filtered endpoint — was previously duplicated
// between getCases and getStatistics. Accepts `object` and casts
// internally so callers can pass any of our strict, named-field
// interfaces (like Filters) without needing an index signature.
function buildQueryString(filters: object): string {
    const params = new URLSearchParams();
    Object.entries(filters as Record<string, unknown>).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
            params.append(key, String(val));
        }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export const apiClient = {
    async getHealth(): Promise<HealthResponse> {
        const response = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
        return handleResponse<HealthResponse>(response);
    },

    async getCases(filters: Filters = {}): Promise<CaseListResponse> {
        const response = await fetch(`${BASE_URL}/cases${buildQueryString(filters)}`, { cache: "no-store" });
        return handleResponse<CaseListResponse>(response);
    },

    async getCase(recordId: number): Promise<SingleCaseResponse> {
        const response = await fetch(`${BASE_URL}/cases/${recordId}`, { cache: "no-store" });
        return handleResponse<SingleCaseResponse>(response);
    },

    async getCaseDetail(recordId: number): Promise<CaseDetailResponse> {
        const response = await fetch(`${BASE_URL}/cases/${recordId}/detail`, { cache: "no-store" });
        return handleResponse<CaseDetailResponse>(response);
    },

    async getStatistics(
        filters: Pick<Filters, "state" | "constituency" | "mp_name" | "work_type" | "priority"> = {}
    ): Promise<StatisticsResponse> {
        const response = await fetch(`${BASE_URL}/statistics${buildQueryString(filters)}`, { cache: "no-store" });
        return handleResponse<StatisticsResponse>(response);
    },
};

export default apiClient;