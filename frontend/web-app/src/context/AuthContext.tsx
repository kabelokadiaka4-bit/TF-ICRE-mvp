"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut, IdTokenResult } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";

// Define available roles
export type UserRole = "admin" | "manager" | "analyst" | "viewer";

interface AuthContextType {
  user: User | null;
  role: UserRole; // Current active role
  claims: { [key: string]: any }; // Custom claims from Firebase token
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "viewer",
  claims: {},
  loading: true,
  signOut: async () => {},
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("viewer");
  const [claims, setClaims] = useState<{ [key: string]: any }>({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch custom claims to determine role
        // Note: In a real app, you'd set these claims via Cloud Functions on sign-up/admin action
        const tokenResult = await currentUser.getIdTokenResult();
        setClaims(tokenResult.claims);
        
        // Mock role assignment logic based on email for demo purposes
        // In production, use tokenResult.claims.role
        if (currentUser.email?.includes("admin")) {
          setRole("admin");
        } else if (currentUser.email?.includes("manager")) {
          setRole("manager");
        } else {
          setRole("analyst"); // Default for now
        }
      } else {
        setUser(null);
        setRole("viewer");
        setClaims({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper to check if user has required permissions
  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    return role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ user, role, claims, loading, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);