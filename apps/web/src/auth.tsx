import * as React from "react";
import { z } from "zod/v4";

export const userSchema = z.object({
  createdAt: z.date(),
  email: z.string(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
  name: z.string().nullable(),
  id: z.string(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

export interface AuthContext {
  isAuthenticated: boolean;
  updateUser: (user: null | User) => void;
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

// TODO: Move away from Context in favor of something like React Query or Zustand or XState
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<null | User>(getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!user);

  function updateUser(user: null | User) {
    updateLocalStorageUser(user);
    setUser(user);
    setIsAuthenticated(!!user);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        updateUser,
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
