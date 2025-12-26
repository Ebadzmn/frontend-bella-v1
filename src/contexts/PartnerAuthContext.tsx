import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from "../config/api";

interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  businessName: string;
  businessLicense: string;
}

interface PartnerAuthState {
  partner: Partner | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface PartnerAuthContextType extends PartnerAuthState {
  setPartnerAuth: (partner: Partner, token: string) => void;
  logout: () => void;
}

const PartnerAuthContext = createContext<PartnerAuthContextType | undefined>(
  undefined
);

export function PartnerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PartnerAuthState>({
    partner: null,
    token: localStorage.getItem("partnerToken"),
    isLoading: true,
    isAuthenticated: false,
  });

  const setPartnerAuth = (partner: Partner, token: string) => {
    localStorage.setItem("partnerToken", token);
    localStorage.setItem("partner", JSON.stringify(partner));
    setState({
      partner,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("partner");
    setState({
      partner: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // Check for existing partner token on mount
  useEffect(() => {
    // Check for URL token first (Magic Link / App Handoff)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const isPartnerRoute = window.location.pathname.startsWith('/partner');

    if (urlToken && isPartnerRoute) {
      localStorage.setItem('partnerToken', urlToken);
      
      // Clean URL without refresh
      params.delete('token');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }

    const initAuth = async () => {
      const token = localStorage.getItem("partnerToken");

      if (token) {
        try {
          // Verify with backend
          const response = await fetch(getApiUrl("partner-auth/me"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Update partner data from backend
            localStorage.setItem("partner", JSON.stringify(data.partner));
            setState({
              partner: data.partner,
              token,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            // Token invalid or partner inactive
            console.log("Session invalid, logging out");
            logout();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Don't logout on network error, just keep local state?
          // Or logout to be safe?
          // If network error, maybe we shouldn't logout immediately.
          // But for "auto logout" requirement, aggressive is better.
          logout();
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  return (
    <PartnerAuthContext.Provider value={{ ...state, setPartnerAuth, logout }}>
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const context = useContext(PartnerAuthContext);
  if (context === undefined) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
}
