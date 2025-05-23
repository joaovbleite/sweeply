
import React from "react";
import { Zap, Brain, Users, CheckCircle, Rocket, Milestone } from "lucide-react"; // Added Rocket, Milestone

const storyPoints = [
  {
    icon: Zap,
    title: "The Initial Spark (2021)",
    description: "A question ignited our journey: Can robots transcend tools to become true human collaborators in complex environments?",
    delay: "0.1s"
  },
  {
    icon: Brain,
    title: "Intensive R&D (2022-2023)",
    description: "Years of dedicated research by our brilliant engineers and AI specialists, pushing the known limits of robotics and machine learning.",
    delay: "0.2s"
  },
  {
    icon: Users, // Could be 'Cpu' or 'Cog' for building Atlas
    title: "Project Atlas Emerges (2024)",
    description: "Atlas, our flagship humanoid, was born from this relentless pursuit, merging state-of-the-art hardware with profoundly intelligent AI.",
    delay: "0.3s"
  },
  {
    icon: Rocket, // Changed from CheckCircle for a more forward-looking feel
    title: "The Journey Forward (Today)",
    description: "We continuously evolve Atlas, fueled by real-world application, user insights, and an unwavering mission to build the most intuitive humanoid.",
    delay: "0.4s"
  }
];

const OurStory = () => {
  return (
    <section id="our-story" className="py-12 sm:py-16 md:py-20 bg-gray-50 scroll-mt-20"> {/* Added id and scroll-mt */}
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16 opacity-0 animate-fade-in">
          <div className="pulse-chip inline-flex items-center mb-4">
             <Milestone size={16} className="mr-2 text-pulse-500" /> {/* Added Milestone icon */}
            <span>Our Evolutionary Milestones</span>
          </div>
          <h2 className="section-title text-gray-900">The Story of Pulse Robot</h2>
          <p className="section-subtitle max-w-2xl mx-auto text-gray-700"> {/* Slightly different subtitle */}
            From a visionary concept to a leader in humanoid robotics, trace our path of innovation.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="relative pl-8 border-l-2 border-pulse-200"> {/* Timeline effect */}
            {storyPoints.map((point, index) => (
              <div 
                key={index} 
                className="mb-10 ml-4 opacity-0 animate-fade-in-left" // Changed to animate-fade-in-left
                style={{ animationDelay: point.delay }}
              >
                <div className="absolute w-4 h-4 bg-pulse-500 rounded-full -left-[26px] border-4 border-gray-50 box-content"></div>
                <div className="p-6 bg-white rounded-xl shadow-elegant hover-lift relative overflow-hidden">
                  {/* Decorative accent */}
                  <div className="absolute top-0 left-0 h-full w-1.5 bg-pulse-400"></div>
                  <div className="flex items-start space-x-4 pl-3">
                    <div className="bg-pulse-100 text-pulse-500 p-3 rounded-full shrink-0">
                      <point.icon size={24} /> {/* Slightly smaller icon */}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">{point.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
