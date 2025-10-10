import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useProtectedRoute(requiredRole?: "ADMIN" | "SUPER ADMIN") {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }

      if (requiredRole && user) {
        // Check if user has the required role
        if (user.role !== requiredRole && user.role !== "SUPER ADMIN") {
          // Redirect to unauthorized page or dashboard
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router]);

  return { user, loading };
}
