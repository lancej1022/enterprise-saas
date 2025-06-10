import * as React from "react";
import { useAuth } from "@/auth";

const API_BASE_URL = "http://localhost:8080/api";

interface ApiError {
  error: string;
}

export class ApiClient {
  private refreshToken: () => Promise<boolean>;
  private logout: () => Promise<void>;

  constructor(
    refreshToken: () => Promise<boolean>,
    logout: () => Promise<void>,
  ) {
    this.refreshToken = refreshToken;
    this.logout = logout;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = false,
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Always include credentials to send cookies
    const requestOptions: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    let response = await fetch(url, requestOptions);

    // If we get a 401 and this was an authenticated request, try to refresh
    if (response.status === 401 && requireAuth) {
      const refreshSuccess = await this.refreshToken();
      if (refreshSuccess) {
        // Retry the request - cookies should now have new access token
        response = await fetch(url, requestOptions);
      } else {
        // Refresh failed, logout user
        await this.logout();
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this will be replaced by a more real API in a near future commit
      const errorData = (await response.json()) as ApiError;
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this will be replaced by a more real API in a near future commit
    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "GET" }, requireAuth);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    requireAuth = false,
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth,
    );
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    requireAuth = false,
  ): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth,
    );
  }

  async delete<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" }, requireAuth);
  }
}

export function useApiClient() {
  const { refreshToken, logout } = useAuth();

  return React.useMemo(
    () => new ApiClient(refreshToken, logout),
    [refreshToken, logout],
  );
}
