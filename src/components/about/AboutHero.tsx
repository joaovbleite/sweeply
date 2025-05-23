
import React from "react";
import { ArrowRight, TrendingUp } from "lucide-react"; // Added TrendingUp for tagline

const AboutHero = () => {
  return (
    <section 
      className="relative bg-cover py-16 sm:py-24 md:py-32"
      style={{ 
        backgroundImage: 'url("/Header-background.webp")', 
        backgroundPosition: 'center 30%' 
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div> {/* Slightly darker overlay for better contrast */}
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 text-center">
        <div 
          className="pulse-chip mb-4 sm:mb-6 inline-flex items-center opacity-0 animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        >
          <TrendingUp size={16} className="mr-2 text-pulse-500" /> 
          <span>Our Genesis & Ambition</span> {/* More evocative chip text */}
        </div>
        <h1 
          className="section-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-white opacity-0 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        >
          Pioneering the Future of Human-Robot Interaction
        </h1>
        <p 
          style={{ animationDelay: "0.5s" }} 
          className="section-subtitle mt-4 sm:mt-6 leading-relaxed text-gray-100 max-w-3xl mx-auto opacity-0 animate-fade-in" // Lighter text for better readability
        >
          At Pulse Robot, we're not just building robots; we're crafting the future of collaboration. Atlas is the culmination of relentless innovation, designed to seamlessly integrate with and elevate human potential.
        </p>
        {/* New Tagline */}
        <p 
          style={{ animationDelay: "0.6s" }}
          className="mt-4 text-lg sm:text-xl text-pulse-300 font-display italic opacity-0 animate-fade-in max-w-2xl mx-auto"
        >
          "Where innovation meets intuition, creating companions for a new era."
        </p>
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8 sm:mt-10 opacity-0 animate-fade-in" 
          style={{ animationDelay: "0.8s" }} // Adjusted delay
        >
          <a 
            href="#our-story" // Link to the OurStory section
            className="button-primary group flex items-center justify-center w-full sm:w-auto"
          >
            Explore Our Journey
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
