
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA"; // Reusing the existing CTA
import PricingHero from "@/components/pricing/PricingHero";
import PricingCards from "@/components/pricing/PricingCards";
import PricingFAQ from "@/components/pricing/PricingFAQ";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  // Initialize intersection observer for animations
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 sm:pt-24 md:pt-28"> {/* Adjusted padding for fixed navbar */}
        <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <PricingCards isAnnual={isAnnual} />
        <PricingFAQ />
        <CTA /> {/* Re-using the existing CTA component */}
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
