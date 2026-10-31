// src/auth/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// True while the URL still carries OAuth callback data Supabase is processing.
const hasAuthCallbackInUrl = () => {
  const { hash, search } = window.location;
  return (
    hash.includes("access_token=") ||
    hash.includes("error=") ||
    search.includes("code=") ||
    search.includes("error=")
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let fallbackTimer;

    const finish = (sessionUser) => {
      if (!active) return;
      setUser(sessionUser);
      setAuthLoading(false);
    };

    // Subscribe first so we never miss the SIGNED_IN event from the callback.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      if (event === "INITIAL_SESSION" && !newUser && hasAuthCallbackInUrl()) {
        return; // still exchanging tokens; wait for SIGNED_IN
      }
      finish(newUser);
      if (newUser && event === "SIGNED_IN" && window.location.pathname === "/login") {
        navigate("/map", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) return finish(session.user);
      if (hasAuthCallbackInUrl()) {
        // Give the token exchange time; never bounce the player mid-callback.
        fallbackTimer = setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          finish(data.session?.user ?? null);
        }, 8000);
        return;
      }
      finish(null);
    });

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  // Returns { error } so the login screen can show what went wrong.
  const login = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/map` },
      });
      if (error) return { error };
      if (!data?.url) return { error: new Error("No sign-in link was returned.") };
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading }}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
