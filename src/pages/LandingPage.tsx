import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/landingpage/Navbar";
import { HeroSection } from "../components/landingpage/HeroSection";
import { HowItWorksSection } from "../components/landingpage/HowItWorksSection";
import { FeaturesSection } from "../components/landingpage/FeaturesSection";
import { PricingSection } from "../components/landingpage/PricingSection";
import { LocationSearchSection } from "../components/landingpage/LocationSearchSection";
import { TestimonialsSection } from "../components/landingpage/TestimonialsSection";
import { CTASection } from "../components/landingpage/CTASection";
import { Footer } from "../components/landingpage/Footer";
import { AppWelcomeScreen } from "../components/landingpage/AppWelcomeScreen";

export default function LandingPage() {
  const [, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const isNative = Capacitor.isNativePlatform();

  if (isLoading) {
    return <div className="min-h-screen bg-black" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (isNative) {
    return <AppWelcomeScreen />;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-sans bg-black text-white">
      <Navbar scrollToSection={scrollToSection} />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection scrollToSection={scrollToSection} />
      <PricingSection />
      <LocationSearchSection />
      <TestimonialsSection />
      <CTASection />
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
}
