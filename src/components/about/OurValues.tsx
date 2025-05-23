
import React from "react";
import { Zap, Users, CheckCircle, Brain, ShieldCheck, Lightbulb } from "lucide-react"; // Added ShieldCheck, Lightbulb

const values = [
  { icon: Lightbulb, title: "Pioneering Innovation", description: "Relentlessly pursuing breakthroughs that redefine the boundaries of robotics and AI." },
  { icon: Users, title: "Synergistic Collaboration", description: "Building strong partnerships between humans and machines, and fostering a deeply collaborative team culture." },
  { icon: ShieldCheck, title: "Unwavering Integrity", description: "Committing to the highest ethical standards and absolute transparency in all our operations and creations." },
  { icon: Brain, title: "Continuous Evolution", description: "Embracing a culture of perpetual learning and adaptation, for our technology, our team, and our organization." },
];

const OurValues = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-pulse-500 text-white">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16 opacity-0 animate-fade-in">
          <h2 className="section-title text-white">Our Guiding Principles</h2>
          <p className="section-subtitle max-w-2xl mx-auto text-gray-100"> {/* Lighter subtitle */}
            These core tenets are embedded in every decision, every design, and every line of code at Sweeply.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"> {/* Slightly reduced gap for tighter look */}
          {values.map((value, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 bg-white/5 rounded-xl opacity-0 animate-fade-in hover-lift border border-white/10 transition-all duration-300 hover:bg-white/10" // Softer bg, added border
              style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-white/20 to-white/10 p-4 rounded-full mb-5 shadow-lg"> {/* Gradient icon bg, larger padding, shadow */}
                <value.icon size={32} className="text-white" /> {/* Larger icon */}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{value.title}</h3>
              <p className="text-gray-200 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurValues;
