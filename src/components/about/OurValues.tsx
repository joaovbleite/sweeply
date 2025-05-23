
import React from "react";
import { Zap, Users, CheckCircle, Brain } from "lucide-react";

const values = [
  { icon: Zap, title: "Innovation", description: "Constantly pushing the boundaries of what's possible in robotics and AI." },
  { icon: Users, title: "Collaboration", description: "Fostering partnerships between humans and machines, and within our team." },
  { icon: CheckCircle, title: "Integrity", description: "Committing to ethical practices and transparency in all our endeavors." },
  { icon: Brain, title: "Continuous Learning", description: "Embracing growth and adaptation, for our robots and our organization." },
];

const OurValues = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-pulse-500 text-white">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="section-title text-white">Our Core Values</h2>
          <p className="section-subtitle max-w-2xl mx-auto text-gray-200">
            These principles guide every decision we make and every line of code we write.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 bg-white/10 rounded-xl opacity-0 animate-fade-in hover-lift"
              style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
            >
              <div className="bg-white/20 p-3 rounded-full mb-4">
                <value.icon size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurValues;
