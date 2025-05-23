
import React from "react";

const OurMission = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16">
          <div className="pulse-chip inline-block mb-4">
            <span>Our Purpose</span>
          </div>
          <h2 className="section-title text-gray-900">Our Mission & Vision</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            We are driven by the challenge of creating intelligent machines that work seamlessly alongside humans, fostering innovation and improving lives.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="opacity-0 animate-fade-in-right">
            <img 
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop" 
              alt="Robotics innovation" 
              className="rounded-xl sm:rounded-2xl shadow-elegant w-full h-auto object-cover"
            />
          </div>
          <div className="opacity-0 animate-fade-in-left" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-pulse-500 mb-4">Empowering Humans Through AI</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our mission is to develop advanced humanoid robots that are not just tools, but collaborative partners. We envision a world where robots like Atlas augment human capabilities, automate mundane tasks, and open new frontiers in research, industry, and daily life.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We are committed to ethical AI development, ensuring our creations are safe, reliable, and beneficial to society. The future is collaborative, and Atlas is leading the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
