
import React from "react";
import { Linkedin, Briefcase } from "lucide-react"; // Added Linkedin, Briefcase

const teamMembers = [
  { name: "Dr. Evelyn Reed", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", bioSnippet: "Visionary leader with 20+ years in AI and Robotics, driving the future of human-machine collaboration." },
  { name: "Marcus Chen", role: "Lead Robotics Engineer", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", bioSnippet: "Expert in mechatronics and control systems, architecting Atlas's groundbreaking hardware." },
  { name: "Aisha Khan", role: "Head of AI Development", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", bioSnippet: "Pioneering neural networks and machine learning algorithms that give Atlas its intelligence." },
];

const OurTeam = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50"> {/* Subtle gradient background */}
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16 opacity-0 animate-fade-in">
          <div className="pulse-chip inline-flex items-center mb-4">
            <Briefcase size={16} className="mr-2 text-pulse-500" />
            <span>Our Architects of Innovation</span>
          </div>
          <h2 className="section-title text-gray-900">Meet the Sweeply Pioneers</h2>
          <p className="section-subtitle max-w-2xl mx-auto text-gray-700">
            The dedicated individuals shaping the future of robotics. (Content is illustrative)
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-elegant hover-lift transition-all duration-300 flex flex-col opacity-0 animate-fade-in p-6 text-center" // Added flex column
              style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
            >
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full mx-auto mb-5 object-cover border-4 border-pulse-200 shadow-md" // Enhanced image style
              />
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-1">{member.name}</h3>
              <p className="text-pulse-500 font-medium text-sm sm:text-base mb-3">{member.role}</p>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 px-2 flex-grow">{member.bioSnippet}</p> {/* Added bio snippet */}
              <div className="mt-auto pt-3 border-t border-gray-200"> {/* Social link placeholder */}
                <a href="#" className="text-gray-400 hover:text-pulse-500 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
