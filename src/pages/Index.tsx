/** @jsxImportSource react */
import * as React from 'react';
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

const Index = () => {
  const { user, loading } = useAuth();
  const [isPwa, setIsPwa] = React.useState(false);

  // Check if the app is being run as PWA (installed on home screen)
  React.useEffect(() => {
    // Check if app is launched from home screen
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // For iOS Safari which has navigator.standalone property
    const isFromHomeScreen = !!window.navigator.standalone;
    setIsPwa(isStandalone || isFromHomeScreen);
  }, []);

  // Redirect to login/dashboard only if opened as PWA
  if (!loading && isPwa) {
    if (!user) {
      return React.createElement(Navigate, { to: "/login", replace: true });
    } else {
      return React.createElement(Navigate, { to: "/dashboard", replace: true });
    }
  }

  // For browser visits, we'll show the landing page
  // Only redirect authenticated users to dashboard
  if (!loading && user && !isPwa) {
    return React.createElement(Navigate, { to: "/dashboard", replace: true });
  }

  // Show loading while authentication state is being determined
  if (loading) {
    return React.createElement(
      "div", 
      { className: "min-h-screen flex items-center justify-center" },
      React.createElement(
        "div", 
        { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500" }
      )
    );
  }

  // Initialize intersection observer to detect when elements enter viewport
  React.useEffect(() => {
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
  }, []);

  React.useEffect(() => {
    // This helps ensure smooth scrolling for the anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        // Increased offset to account for mobile nav
        const offset = window.innerWidth < 768 ? 100 : 80;
        
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return React.createElement(
    "div",
    { className: "min-h-screen" },
    React.createElement(Navbar),
    React.createElement(
      "main",
      { className: "space-y-4 sm:space-y-8" },
      React.createElement(Hero),
      React.createElement(HumanoidSection),
      React.createElement(SpecsSection),
      React.createElement(DetailsSection),
      React.createElement(ImageShowcaseSection),
      React.createElement(Features),
      React.createElement(Testimonials),
      React.createElement(BusinessStats),
      React.createElement(MadeByHumans)
    ),
    React.createElement(Footer)
  );
};

export default Index;
