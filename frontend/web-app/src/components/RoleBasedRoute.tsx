"use client";

import { useAuth, UserRole } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!allowedRoles.includes(role)) {
        // Redirect to unauthorized page or dashboard
        console.warn(`User with role ${role} attempted to access restricted page. Required: ${allowedRoles.join(", ")}`);
        router.push("/"); // or /unauthorized
      }
    }
  }, [user, role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-on-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render children only if user is authorized
  if (user && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return null; // Or a "Access Denied" component
}
