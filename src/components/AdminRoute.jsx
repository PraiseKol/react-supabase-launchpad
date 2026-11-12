import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminRoute({ children }) {
  const { user, authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("game_users")
          .select("is_admin, role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error verifying admin status:", error);
          setIsAdmin(false);
          return;
        }

        const adminGranted =
          data?.is_admin === true ||
          data?.role === "admin" ||
          data?.role === "super_admin";

        setIsAdmin(Boolean(adminGranted));
      } catch (err) {
        console.error("Admin verification exception:", err);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user?.id, authLoading]);

  if (authLoading || isAdmin === null) {
    return <LoadingScreen message="Verifying admin access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/map" replace />;
  }

  return children;
}
