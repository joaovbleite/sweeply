
import React from "react";
import { User } from "lucide-react";

const teamMembers = [
  { name: "Dr. Evelyn Reed", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { name: "Marcus Chen", role: "Lead Robotics Engineer", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { name: "Aisha Khan", role: "Head of AI Development", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
];

const OurTeam = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-10 sm:mb-16">
          <div className="pulse-chip inline-block mb-4">
            <span>Our Experts</span>
          </div>
          <h2 className="section-title text-gray-900">Meet the Team</h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            The brilliant minds behind Atlas and Pulse Robot. (Content is illustrative)
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="text-center p-6 bg-gray-50 rounded-xl shadow-elegant hover-lift opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
            >
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-pulse-100"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{member.name}</h3>
              <p className="text-pulse-500 font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTeam;
