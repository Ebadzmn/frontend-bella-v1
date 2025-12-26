import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import logoUrl from "/BellaLogo.png";
import HeroImg from "/Bella.png";

export const AppWelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  // Initialize state based on session storage
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("hasShownSplash");
  });
  const [fadeContent, setFadeContent] = useState(false);

  useEffect(() => {
    if (!showSplash) return;

    // Start splash sequence
    const splashTimer = setTimeout(() => {
      setFadeContent(true); // Trigger fade out of splash / fade in of content
      setTimeout(() => {
        setShowSplash(false); // Actually switch views
        sessionStorage.setItem("hasShownSplash", "true");
      }, 500); // Wait for fade transition
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(splashTimer);
  }, [showSplash]);

  const handleSubscribe = () => {
    navigate("/register");
  };

  if (showSplash) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
          fadeContent ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center">
          <img
            src={logoUrl}
            alt="Bella Logo"
            className="w-64 h-64 object-contain animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black text-white overflow-hidden flex flex-col animate-fade-in">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={HeroImg}
          alt="Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />
      </div>

      {/* Header: Logo and Sign In */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4">
        <img
          src={logoUrl}
          alt="Bella Logo"
          className="w-16 h-16 object-contain"
        />
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/partner-login")}
            className="text-xs text-gray-300 hover:text-white transition-colors font-medium"
          >
            Partner Login
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 bg-yellow-500 text-black rounded text-sm font-bold hover:bg-yellow-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Middle Content: Promotion */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 space-y-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight animate-slide-up">
          Unlimited shine.
          <br />
          One simple subscription.
        </h1>

        {/* Feature points with checks */}
        <div className="flex flex-col gap-3 text-sm md:text-base text-gray-200 mt-4 animate-slide-up delay-100 items-start text-left max-w-xs mx-auto">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <span>Wash your car at approved locations</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <span>Expanding nationwide every month</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <span>Flexible plans – cancel anytime</span>
          </div>
        </div>
      </main>

      {/* Bottom: Subscribe Button */}
      <footer className="relative z-10 px-6 py-8 pb-12 w-full max-w-md mx-auto animate-slide-up delay-200 flex flex-col gap-4 text-center">
        <button
          onClick={handleSubscribe}
          className="w-full py-4 bg-yellow-500 text-black font-bold text-lg rounded shadow-lg hover:bg-yellow-600 transition-colors uppercase tracking-wide"
        >
          Join Bella Car Wash today
        </button>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 w-full my-1">
          <div className="h-px bg-gray-700 w-full"></div>
          <span className="shrink-0 px-2">OR</span>
          <div className="h-px bg-gray-700 w-full"></div>
        </div>

        <button
          onClick={() => navigate("/partner-signup")}
          className="w-full py-4 bg-gray-800 border border-gray-700 text-white font-bold text-lg rounded shadow-lg hover:bg-gray-700 transition-colors uppercase tracking-wide"
        >
          Become a Partner
        </button>

        <p className="text-xs text-gray-400 mt-2">
          Create a Bella Car Wash account to get started.
        </p>
      </footer>
    </div>
  );
};
