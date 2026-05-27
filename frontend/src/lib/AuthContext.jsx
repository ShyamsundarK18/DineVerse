import React, { createContext, useState, useContext, useEffect } from "react";
import { api } from "@/api/client";
import { appParams } from "@/lib/app-params";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      setAppPublicSettings({ id: "local", public_settings: {} });

      await checkUserAuth();

      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      setAuthError({
        type: "unknown",
        message: error.message || "An unexpected error occurred",
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await api.auth.me();

      // 🛠️ CRITICAL LOGIC FIX: Check if user profile data node actually exists
      if (currentUser && (currentUser._id || currentUser.id)) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        // Token invalid hai ya user logged in nahi hai
        setUser(null);
        setIsAuthenticated(false);
        // Isse aap logged-in states ke beech loop nahi karenge
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error("User auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);

      // Trigger standard auth redirection fallback paths
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setAuthError({
          type: "auth_required",
          message: "Authentication required. Please login again.",
        });
      }
    }
  };
  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      api.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      api.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    api.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
