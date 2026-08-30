import {
  HealthResponse,
  CaseListResponse,
  SingleCaseResponse,
  StatisticsResponse
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
        errorMessage = typeof errorJson.detail === "string" 
          ? errorJson.detail 
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // JSON parsing failed, fallback to default error
    }
    throw new ApiError(errorMessage, response.status);
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  async getHealth(): Promise<HealthResponse> {
    const url = `${BASE_URL}/health`;
    const response = await fetch(url, { cache: "no-store" });
    return handleResponse<HealthResponse>(response);
  },

  async getCases(filters: Record<string, any> = {}): Promise<CaseListResponse> {
    const queryParams = new URLSearchParams();
    
    // Append query params if they are defined
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== "") {
        queryParams.append(key, String(val));
      }
    });

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/cases${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, { cache: "no-store" });
    return handleResponse<CaseListResponse>(response);
  },

  async getCase(recordId: number): Promise<SingleCaseResponse> {
    const url = `${BASE_URL}/cases/${recordId}`;
    const response = await fetch(url, { cache: "no-store" });
    return handleResponse<SingleCaseResponse>(response);
  },

  async getStatistics(filters: Record<string, any> = {}): Promise<StatisticsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== "") {
        queryParams.append(key, String(val));
      }
    });

    const queryString = queryParams.toString();
    const url = `${BASE_URL}/statistics${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, { cache: "no-store" });
    return handleResponse<StatisticsResponse>(response);
  }
};
export default apiClient;
