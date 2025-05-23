
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHero from "@/components/about/AboutHero";
import OurMission from "@/components/about/OurMission";
import OurStory from "@/components/about/OurStory";
import OurTeam from "@/components/about/OurTeam";
import OurValues from "@/components/about/OurValues";
import CTA from "@/components/CTA"; // Reusing the CTA component

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on page load
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            // For directional animations, ensure they are also triggered
            if (entry.target.classList.contains('animate-fade-in-left') || entry.target.classList.contains('animate-fade-in-right')) {
              // Already handled by the class itself if CSS is set up for it with IntersectionObserver
            } else {
               entry.target.classList.add("opacity-100"); // Fallback for simple fade-in
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Query for all elements that need animation, including directional ones
    const elements = document.querySelectorAll(".animate-fade-in, .animate-fade-in-left, .animate-fade-in-right, .animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <AboutHero />
        <OurMission />
        <OurStory />
        <OurTeam />
        <OurValues />
        <CTA /> {/* Re-using the existing CTA component */}
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
