import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HumanoidSection from "@/components/HumanoidSection";
import SpecsSection from "@/components/SpecsSection";
import DetailsSection from "@/components/DetailsSection";
import ImageShowcaseSection from "@/components/ImageShowcaseSection";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import BusinessStats from "@/components/Newsletter";
import MadeByHumans from "@/components/MadeByHumans";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

// This ensures we show the landing page when accessed via browser URL
// and only redirect to login/dashboard when used as a PWA
const Index = () => {
  const { user, loading } = useAuth();
  const [isPwa, setIsPwa] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  
  // Detect if the app is being run as a PWA
  useEffect(() => {
    // Check if we should force landing page
    const urlParams = new URLSearchParams(window.location.search);
    const forceLanding = urlParams.get('landing') === 'true';
    
    if (forceLanding) {
      setShowLanding(true);
      // Remove PWA detection from local storage if force landing is used
      localStorage.removeItem('isPwa');
      return;
    }
    
    // Check if app is launched as PWA using display-mode media query
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // For iOS Safari which has navigator.standalone property
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isFromHomeScreen = isiOS && Boolean(
      // @ts-ignore - navigator.standalone exists in Safari but not in standard TS types
      window.navigator.standalone
    );
    
    const isPwaMode = isStandalone || isFromHomeScreen;
    setIsPwa(isPwaMode);
    
    // Store PWA detection in localStorage for debug purposes
    localStorage.setItem('isPwa', String(isPwaMode));
    localStorage.setItem('isStandalone', String(isStandalone));
    localStorage.setItem('isFromHomeScreen', String(isFromHomeScreen));
    
    // Log for debugging
    console.log("Index.tsx - PWA Detection:", {
      isPwaMode,
      isStandalone,
      isFromHomeScreen,
      isiOS,
      userAgent: navigator.userAgent
    });
    
    // If in PWA mode or user is authenticated, don't show landing
    if (isPwaMode) {
      setShowLanding(false);
    }
  }, []);
  
  // Update landing page visibility when auth state changes
  useEffect(() => {
    if (!loading && user) {
      // If user is authenticated, don't show landing
      setShowLanding(false);
  }
  }, [loading, user]);

  // Initialize intersection observer to detect when elements enter viewport
  useEffect(() => {
    // Only set up the observer if we're showing the landing page
    if (!showLanding) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [showLanding]);

  // Set up smooth scrolling for anchor links
  useEffect(() => {
    // Only set up smooth scrolling if we're showing the landing page
    if (!showLanding) return;
    
    const handleAnchorClick = function(e: Event) {
        e.preventDefault();
        
      const target = e.currentTarget as HTMLAnchorElement;
      const targetId = target.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        // Increased offset to account for mobile nav
        const offset = window.innerWidth < 768 ? 100 : 80;
        
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
    };
    
    // Add event listeners
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });
    
    // Clean up
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, [showLanding]);

  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500"></div>
      </div>
    );
  }

  // Redirect to login if in PWA mode and not authenticated
  if (!loading && isPwa && !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to dashboard if authenticated (regardless of mode)
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If not in PWA mode and not authenticated, show landing page
  if (showLanding) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="space-y-4 sm:space-y-8"> {/* Reduced space on mobile */}
        <Hero />
        <HumanoidSection />
        <SpecsSection />
        <DetailsSection />
        <ImageShowcaseSection />
        <Features />
        <Testimonials />
        <BusinessStats />
        <MadeByHumans />
      </main>
      <Footer />
    </div>
  );
  }
  
  // Fallback redirect to login if something unexpected happens
  return <Navigate to="/login" replace />;
};

export default Index;
