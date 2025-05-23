
import React from "react";
import { Zap, Brain, Users, CheckCircle } from "lucide-react";

const storyPoints = [
  {
    icon: Zap,
    title: "The Spark of an Idea",
    description: "It began with a simple question: What if robots could truly understand and adapt to human environments and needs?",
    delay: "0.1s"
  },
  {
    icon: Brain,
    title: "Years of Research",
    description: "Our dedicated team of engineers and AI specialists spent years in R&D, pushing the boundaries of robotics and machine learning.",
    delay: "0.2s"
  },
  {
    icon: Users,
    title: "Building Atlas",
    description: "Atlas, our flagship humanoid, was born from this relentless pursuit of innovation, combining cutting-edge hardware with sophisticated AI.",
    delay: "0.3s"
  },
  {
    icon: CheckCircle,
    title: "The Journey Ahead",
    description: "Today, we continue to evolve Atlas, driven by user feedback and a commitment to creating the most intuitive and capable humanoid robot.",
    delay: "0.4s"
  }
];

const OurStory = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16">
          <div className="pulse-chip inline-block mb-4">
            <span>Our Journey</span>
          </div>
          <h2 className="section-title text-gray-900">The Story of Pulse Robot</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-10">
            {storyPoints.map((point, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-6 glass-card opacity-0 animate-fade-in"
                style={{ animationDelay: point.delay }}
              >
                <div className="bg-pulse-100 text-pulse-500 p-3 rounded-full mb-4">
                  <point.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{point.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
