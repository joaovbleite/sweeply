import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  FileText, 
  Users, 
  Layers, 
  Brain, 
  MessageCircle,
  CheckCircle,
  TrendingUp,
  Shield
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  gradient: string;
  benefits: string[];
}

const FeatureCard = ({ icon, title, description, index, gradient, benefits }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        "group relative opacity-0 p-6 bg-white rounded-2xl shadow-sm border border-gray-100",
        "hover:shadow-xl hover:border-pulse-200 hover:-translate-y-2",
        "transition-all duration-500 ease-out cursor-pointer overflow-hidden"
      )}
      style={{ animationDelay: `${0.15 * index}s` }}
    >
      {/* Background gradient overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
        gradient
      )} />
      
      {/* Icon with gradient background */}
      <div className={cn(
        "relative rounded-2xl w-14 h-14 flex items-center justify-center text-white mb-6",
        "shadow-lg group-hover:shadow-xl transition-all duration-300",
        gradient
      )}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-pulse-700 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>
      
      {/* Benefits list */}
      <ul className="space-y-2">
        {benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      
      {/* Hover arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <div className="w-8 h-8 bg-pulse-500 rounded-full flex items-center justify-center text-white">
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".fade-in-element");
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-fade-in");
              }, index * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "Smart Scheduling",
      description: "Drag-and-drop calendar with recurring appointments, automated reminders, and real-time updates for your entire team.",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      benefits: ["Recurring appointments", "Automated reminders", "Team synchronization"]
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Instant Invoicing",
      description: "Create professional invoices in seconds, send automatic payment reminders, and track what's paid or overdue.",
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
      benefits: ["Professional templates", "Payment tracking", "Automatic reminders"]
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Client Management",
      description: "Keep detailed customer profiles with service history, preferences, special instructions, and contact information.",
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
      benefits: ["Service history", "Custom preferences", "Contact management"]
    },
    {
      icon: <Layers className="w-7 h-7" />,
      title: "Team Coordination",
      description: "Assign jobs to team members, track progress in real-time, and communicate seamlessly with built-in messaging.",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
      benefits: ["Job assignments", "Real-time tracking", "Team messaging"]
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI-Powered Insights",
      description: "Get smart pricing suggestions, market analysis, business insights, and automated recommendations to grow your business.",
      gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
      benefits: ["Smart pricing", "Market analysis", "Growth insights"]
    },
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "Multilingual Support",
      description: "Switch seamlessly between English, Spanish, Portuguese, French, and Chinese. Perfect for diverse client bases.",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      benefits: ["5 languages", "Cultural adaptation", "Global reach"]
    }
  ];
  
  return (
    <section className="py-16 md:py-24 relative bg-gradient-to-b from-gray-50 to-white" id="features" ref={sectionRef}>
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pulse-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pulse-50 to-blue-50 rounded-full blur-3xl opacity-20" />
      </div>
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <div className="pulse-chip mx-auto mb-6 opacity-0 fade-in-element">
            <Shield className="w-4 h-4 mr-2" />
            <span>Powerful Tools</span>
          </div>
          <h2 className="section-title mb-6 opacity-0 fade-in-element">
            Built for Cleaning <br className="hidden sm:block" />Business Success
          </h2>
          <p className="section-subtitle mx-auto max-w-2xl opacity-0 fade-in-element">
            Everything you need to run a professional cleaning business, from scheduling to payments. 
            Designed specifically for immigrant entrepreneurs building their American dream.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              benefits={feature.benefits}
              index={index}
            />
          ))}
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-16 opacity-0 fade-in-element">
          <div className="inline-flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                M
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                J
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Join 1,000+ cleaning professionals</p>
              <p className="text-xs text-gray-600">Already growing their business with Sweeply</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
