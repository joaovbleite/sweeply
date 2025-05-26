import React, { useState } from "react";
import { toast } from "sonner";

const DetailsSection = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: ""
  });
  const [activeTab, setActiveTab] = useState(0);

  const featureTabs = [
    {
      name: "Smart Scheduling",
      features: [
        { title: "Drag & Drop Calendar", description: "Visual scheduling with easy job management" },
        { title: "Recurring Jobs", description: "Set it once for regular clients" },
        { title: "Auto-Reminders", description: "Never let clients forget their appointments" }
      ],
      keyFeatures: [
        { 
          title: "Visual Job Calendar", 
          description: "Drag and drop jobs, see your week at a glance, and manage recurring appointments with ease",
          videoPlaceholder: "Calendar demo video"
        },
        { 
          title: "Smart Notifications", 
          description: "Automatic reminders for clients and real-time updates for your team",
          videoPlaceholder: "Notification system demo"
        }
      ],
      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
      tagline: "Never double-book again",
      headline: "Organize Your Schedule"
    },
    {
      name: "Get Paid Faster",
      features: [
        { title: "Instant Invoices", description: "Professional invoices in seconds" },
        { title: "Payment Tracking", description: "Know who paid and who hasn't" },
        { title: "Auto-Reminders", description: "Gentle nudges for overdue payments" }
      ],
      keyFeatures: [
        { 
          title: "One-Click Invoicing", 
          description: "Create and send branded invoices instantly after completing a job",
          videoPlaceholder: "Invoice creation demo"
        },
        { 
          title: "Payment Dashboard", 
          description: "Track payments, send reminders, and get paid faster with integrated payment processing",
          videoPlaceholder: "Payment tracking demo"
        }
      ],
      gradient: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
      tagline: "Professional invoices instantly",
      headline: "Get Paid On Time"
    },
    {
      name: "Client Management",
      features: [
        { title: "Client Database", description: "All customer info in one place" },
        { title: "Service History", description: "Track what was done and when" },
        { title: "Notes & Preferences", description: "Remember the important details" }
      ],
      keyFeatures: [
        { 
          title: "Complete Client Profiles", 
          description: "Store contact info, cleaning preferences, gate codes, and special instructions all in one place",
          videoPlaceholder: "Client profile demo"
        },
        { 
          title: "Service History", 
          description: "View past jobs, notes, and communications to deliver personalized service every time",
          videoPlaceholder: "History tracking demo"
        }
      ],
      gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
      tagline: "Know your clients better",
      headline: "Build Relationships"
    },
    {
      name: "AI Assistant",
      features: [
        { title: "Price Suggestions", description: "AI-powered pricing recommendations" },
        { title: "Instant Translation", description: "Portuguese ↔ English in one click" },
        { title: "Message Templates", description: "Professional communications made easy" }
      ],
      keyFeatures: [
        { 
          title: "Bilingual Support", 
          description: "Switch between English and Portuguese instantly - perfect for immigrant entrepreneurs",
          videoPlaceholder: "Language switching demo"
        },
        { 
          title: "AI-Powered Help", 
          description: "Get pricing suggestions, translate messages, and draft professional communications",
          videoPlaceholder: "AI assistant demo"
        }
      ],
      gradient: "linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)",
      tagline: "Your smart business partner",
      headline: "Work Smarter with AI"
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.fullName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Demo form submission
    toast.success("Request submitted successfully!");

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      company: ""
    });
  };

  return (
    <section id="details" className="w-full bg-white py-0">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          {/* Left Card - Core Features */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant">
            {/* Card Header with gradient background */}
            <div className="relative h-48 sm:h-64 p-6 sm:p-8 flex flex-col items-start justify-between" style={{
              background: "linear-gradient(135deg, #000000 0%, #1a1a1a 20%, #333333 40%, #4d4d4d 60%, #666666 80%, #999999 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
              <h2 className="text-2xl sm:text-3xl font-display text-white font-bold">
                Core Features
              </h2>
              
              {/* Tab buttons */}
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {featureTabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ease-in-out ${
                      activeTab === index
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Card Content */}
            <div className="bg-white p-4 sm:p-8" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #ECECEC"
            }}>
              <div 
                key={activeTab}
                className="animate-fade-in"
              >
                <h3 className="text-lg sm:text-xl font-display mb-6 sm:mb-8">
                  {activeTab === 0 && "Organize jobs and save hours every week"}
                  {activeTab === 1 && "Professional invoicing that gets you paid"}
                  {activeTab === 2 && "Know your clients, grow your business"}
                  {activeTab === 3 && "Built for immigrant entrepreneurs"}
                </h3>

                <div className="space-y-4 sm:space-y-6">
                  {featureTabs[activeTab].features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 opacity-0 animate-fade-in"
                      style={{
                        animationDelay: `${index * 0.15}s`,
                        animationFillMode: 'forwards'
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-pulse-500 flex items-center justify-center mt-1 flex-shrink-0 transition-colors duration-300">
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm border border-gray-100 transition-all duration-200 hover:bg-gray-100/80 hover:shadow-sm hover:border-gray-200">
                          <span className="font-semibold text-base">{feature.title}:</span> {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card - Key Features Showcase */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant">
            {/* Card Header with dynamic gradient */}
            <div className="relative h-48 sm:h-64 p-6 sm:p-8 flex flex-col items-start justify-between transition-all duration-500" style={{
              background: featureTabs[activeTab].gradient,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}>
              <div className="animate-fade-in" key={`tag-${activeTab}`}>
                <div className="inline-block px-4 sm:px-6 py-2 border border-white text-white rounded-full text-xs mb-4">
                  {featureTabs[activeTab].tagline}
                </div>
                <h2 className="text-2xl sm:text-3xl font-display text-white font-bold">
                  {featureTabs[activeTab].headline}
                </h2>
              </div>
            </div>
            
            {/* Card Content - Key Features */}
            <div className="bg-white p-4 sm:p-8" style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #ECECEC"
            }}>
              <div 
                key={`features-${activeTab}`}
                className="animate-fade-in space-y-6"
              >
                {featureTabs[activeTab].keyFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className="opacity-0 animate-fade-in"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      {/* Video/Visualization Placeholder */}
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-32 mb-4 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">{feature.videoPlaceholder}</span>
                      </div>
                      
                      {/* Feature Content */}
                      <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
                
                {/* CTA Button */}
                <div className="pt-4">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-pulse-500 to-pulse-600 hover:from-pulse-600 hover:to-pulse-700 text-white font-medium rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]">
                    Start Free Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailsSection;
