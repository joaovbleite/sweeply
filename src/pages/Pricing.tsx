
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import PricingHero from "@/components/pricing/PricingHero";
import PricingCards from "@/components/pricing/PricingCards";
import PricingTable from "@/components/pricing/PricingTable"; // Import the new table
import PricingFAQ from "@/components/pricing/PricingFAQ";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  // Initialize intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in"); // General fade-in
            // Check for specific scroll-triggered animations if needed
            if (entry.target.classList.contains("animate-on-scroll")) {
              // Add more specific animation classes if desired
              // entry.target.classList.add("some-other-animation");
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Query for all elements that should animate on scroll
    const elements = document.querySelectorAll(".animate-on-scroll, .animate-fade-in");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => {
        if (el) observer.unobserve(el); // Check if el still exists
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 sm:pt-24 md:pt-28"> {/* Adjusted padding for fixed navbar */}
        <PricingHero isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        <PricingCards isAnnual={isAnnual} />
        <PricingTable /> {/* Add the new pricing table here */}
        <PricingFAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
