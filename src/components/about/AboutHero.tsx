
import React from "react";
import { ArrowRight } from "lucide-react";

const AboutHero = () => {
  return (
    <section 
      className="relative bg-cover py-16 sm:py-24 md:py-32"
      style={{ 
        backgroundImage: 'url("/Header-background.webp")', 
        backgroundPosition: 'center 30%' 
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 text-center">
        <div 
          className="pulse-chip mb-4 sm:mb-6 inline-block opacity-0 animate-fade-in" 
          style={{ animationDelay: "0.1s" }}
        >
          <span>Our Story</span>
        </div>
        <h1 
          className="section-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight text-white opacity-0 animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        >
          Pioneering the Future of Human-Robot Interaction
        </h1>
        <p 
          style={{ animationDelay: "0.5s" }} 
          className="section-subtitle mt-4 sm:mt-6 mb-6 sm:mb-8 leading-relaxed text-gray-200 max-w-3xl mx-auto opacity-0 animate-fade-in"
        >
          At Pulse Robot, we believe in a future where technology enhances human potential. Atlas is the embodiment of this vision, a humanoid companion designed to learn, adapt, and collaborate.
        </p>
        <div 
          className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" 
          style={{ animationDelay: "0.7s" }}
        >
          <a 
            href="#contact" 
            className="button-primary group flex items-center justify-center w-full sm:w-auto"
          >
            Get In Touch
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
