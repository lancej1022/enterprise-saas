import * as React from "react";

export interface User {
  createdAt: string;
  email: string;
  id: string;
  isChirpyRed: boolean;
  updatedAt: string;
}

export interface AuthContext {
  checkAuth: () => Promise<boolean>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  signup: (email: string, password: string) => Promise<void>;
  user: null | User;
}

const AuthContext = React.createContext<AuthContext | null>(null);

const USER_KEY = "auth.user";

// Only store user info in localStorage, tokens are in HTTP-only cookies
function getStoredUser(): null | User {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this will be replaced by a more real API in a near future commit
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }
  return null;
}

function updateLocalStorageUser(user: null | User) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<null | User>(getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const logout = React.useCallback(async () => {
    try {
      // Call logout endpoint to clear cookies and revoke refresh token
      await fetch("http://localhost:8080/api/logout", {
        method: "POST",
        credentials: "include", // Important: include cookies
      });
    } catch (error) {
      // eslint-disable-next-line no-console -- debugging
      console.warn("Failed to logout on server:", error);
    }

    updateLocalStorageUser(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshToken = React.useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:8080/api/refresh", {
        method: "POST",
        credentials: "include", // Important: include cookies
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      // Token is now set in HTTP-only cookie, no need to handle response body
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      return false;
    }
  }, [logout]);

  const checkAuth = React.useCallback(async (): Promise<boolean> => {
    try {
      // Try to make an authenticated request to check if we're logged in
      const response = await fetch("http://localhost:8080/api/user/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(true);
        return true;
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          setIsAuthenticated(true);
          return true;
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }

    setIsAuthenticated(false);
    return false;
  }, [refreshToken]);

  const handleAuthResponse = React.useCallback(
    (data: {
      created_at: string;
      email: string;
      id: string;
      is_chirpy_red: boolean;
      updated_at: string;
    }) => {
      const user: User = {
        id: data.id,
        email: data.email,
        isChirpyRed: data.is_chirpy_red,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      updateLocalStorageUser(user);
      setUser(user);
      setIsAuthenticated(true);
    },
    [],
  );

  const login = React.useCallback(
    async (email: string, password: string) => {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this will be replaced by a more real API in a near future commit
        const errorData = (await response.json()) as { error: string };
        throw new Error(errorData.error || "Login failed");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: this will be replaced by a more real API in a near future commit
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO: this will be replaced by a more real API in a near future commit
      handleAuthResponse(data);
    },
    [handleAuthResponse],
  );

  const signup = React.useCallback(
    async (email: string, password: string) => {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TODO: this will be replaced by a more real API in a near future commit
        const errorData = (await response.json()) as { error: string };
        throw new Error(errorData.error || "Signup failed");
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO: this will be replaced by a more real API in a near future commit
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO: this will be replaced by a more real API in a near future commit
      handleAuthResponse(data);
    },
    [handleAuthResponse],
  );

  // Check authentication status on mount
  // React.useEffect(() => {
  //   if (user && !isAuthenticated) {
  //     // We have user data but no auth state, check if we're still authenticated
  //     void checkAuth();
  //   }
  // }, [user, isAuthenticated, checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        refreshToken,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
