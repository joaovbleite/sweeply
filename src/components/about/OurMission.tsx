
import React from "react";

const OurMission = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16 opacity-0 animate-fade-in">
          <div className="pulse-chip inline-block mb-4">
            <span>Our Guiding Purpose</span>
          </div>
          <h2 className="section-title text-gray-900">Defining Our Path</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Driven by a passion for transformative technology and its potential to uplift humanity.
          </p>
        </div>
        
        {/* Our Mission */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 md:mb-16">
          <div className="opacity-0 animate-fade-in-right order-last md:order-first">
            <h3 className="text-2xl sm:text-3xl font-bold text-pulse-500 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To develop advanced humanoid robots that serve as collaborative partners, augmenting human capabilities across research, industry, and daily life. We strive to automate the mundane, unlock new efficiencies, and empower individuals to achieve more.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Ethical development, safety, and societal benefit are the cornerstones of our engineering philosophy, ensuring Atlas is a force for good.
            </p>
          </div>
          <div className="opacity-0 animate-fade-in-left order-first md:order-last" style={{ animationDelay: "0.2s" }}>
            <img 
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop" 
              alt="Robotics innovation in action" 
              className="rounded-xl sm:rounded-2xl shadow-elegant w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Our Vision */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="opacity-0 animate-fade-in-right" style={{ animationDelay: "0.4s" }}>
             <img 
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop" 
              alt="Future landscape representing vision" 
              className="rounded-xl sm:rounded-2xl shadow-elegant w-full h-auto object-cover"
            />
          </div>
          <div className="opacity-0 animate-fade-in-left" style={{ animationDelay: "0.6s" }}>
            <h3 className="text-2xl sm:text-3xl font-bold text-pulse-500 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We envision a future where intelligent machines and humans coexist and collaborate seamlessly, creating a world that is more productive, creative, and equitable. Atlas is a pioneer in this journey, paving the way for robots that understand, adapt, and truly assist.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our goal is to make sophisticated robotics accessible and intuitive, fostering a new era of human-machine synergy that tackles global challenges and enhances the human experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
