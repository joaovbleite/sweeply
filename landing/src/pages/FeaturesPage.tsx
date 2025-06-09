import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  Bell, 
  Smartphone, 
  FileText,
  ChartBar,
  ClipboardList,
  Grid2x2,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

const FeaturesPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      icon: Users,
      title: "Comprehensive Client Management",
      descriptionPoints: [
        "Maintain a detailed database of customer information, including contact details, service addresses, and specific cleaning preferences (e.g., 'Hypoallergenic products for the kids' room').",
        "Access complete client history, notes, and past job details instantly to provide personalized and consistent service.",
        "Segment clients for targeted communication and marketing efforts to boost engagement and loyalty.",
        "Improve client retention through proactive communication tools and personalized service delivery.",
        "Securely store and access all client-related data from any device, anytime, anywhere."
      ],
      quote: "\"Sweeply has revolutionized how we manage client relationships. All the information is at our fingertips, making every interaction professional and personalized.\" - Angela K., Owner of SparkleClean Co."
    },
    {
      icon: Calendar,
      title: "Advanced Booking & Scheduling System",
      descriptionPoints: [
        "Effortlessly schedule one-time, recurring, or on-demand cleaning appointments with flexible date and time selections.",
        "Offer clients a branded self-service portal to book, reschedule, or cancel services 24/7, reducing your admin workload.",
        "Optimize routes and assign jobs intelligently based on cleaner availability, skills, and location to maximize efficiency.",
        "Automate appointment confirmations, reminders (via email/SMS), and follow-ups to minimize no-shows and enhance client communication.",
        "Gain a clear overview of your entire team's schedule with daily, weekly, and monthly calendar views."
      ],
      quote: "\"Our scheduling used to be a daily puzzle. With Sweeply, it's automated, efficient, and has drastically reduced booking errors and missed appointments.\" - David L., Operations Manager, BrightHome Services"
    },
    {
      icon: Smartphone,
      title: "Empower Your Team with Mobile Access",
      descriptionPoints: [
        "Provide your cleaning staff with a dedicated mobile app to view schedules, access job details (including client notes and checklists), and update job statuses in real-time.",
        "Enable seamless communication between the office and field staff, ensuring everyone is on the same page.",
        "Allow cleaners to clock in/out, track travel time, and upload before/after photos directly from their mobile devices.",
        "Offline capabilities ensure essential job information is accessible even in areas with poor connectivity.",
        "Reduce administrative calls and improve operational transparency with instant updates from the field."
      ],
      quote: "\"The Sweeply mobile app has been a game-changer for our team. They have all the info they need on their phones, which has cut down on errors and improved our response times dramatically.\" - Maria P., Team Lead, CleanPro Solutions"
    }
  ];

  const additionalFeatures = [
    { icon: ClipboardList, title: "Efficient Cleaner Assignment", text: "Assign jobs to your cleaning staff based on their real-time availability, geographic proximity, and specific skill sets. Track performance and manage schedules effectively.", points: ["Intelligent staff matching", "Optimize routes & minimize travel", "Real-time availability tracking", "Performance monitoring"] },
    { icon: DollarSign, title: "Streamlined Payment Processing", text: "Integrate secure payment gateways for credit/debit card transactions. Enable clients to pay online and automate invoicing to improve cash flow.", points: ["Secure online payments", "Automated invoicing & receipts", "Payment status tracking", "Faster cash flow"] },
    { icon: ShieldCheck, title: "Secure Customer Portal", text: "Provide clients with a secure, branded portal to manage their bookings, view service history, update preferences, and communicate directly.", points: ["24/7 self-service access", "View & manage bookings", "Secure communication channel", "Update payment methods"] },
    { icon: ChartBar, title: "Insightful Business Reporting", text: "Generate comprehensive reports on job completion rates, revenue streams, client feedback, and cleaner performance to make data-driven decisions.", points: ["Key performance indicators", "Customizable report filters", "Exportable data for analysis", "Track business growth"] },
    { icon: Smartphone, title: "Full Mobile Accessibility", text: "Empower your cleaners with a mobile-friendly interface to view job details, manage schedules, update job status, and navigate to client locations on the go.", points: ["On-the-go job management", "Mobile time tracking & notes", "GPS navigation integration", "Instant notifications"] },
    { icon: Bell, title: "Automated Notifications & Alerts", text: "Keep clients and staff informed with automated appointment confirmations, reminders, cancellations, and job updates via email and SMS.", points: ["Customizable message templates", "Reduce no-shows significantly", "Improve team coordination", "Branded communications"] },
    { icon: Star, title: "Client Feedback & Rating System", text: "Collect valuable client feedback and star ratings after each job to monitor service quality, recognize top performers, and address areas for improvement.", points: ["Build social proof & trust", "Identify service strengths", "Drive continuous improvement", "Track customer satisfaction trends"] },
    { icon: Grid2x2, title: "Intuitive Admin Dashboard", text: "Get a bird's-eye view of your entire operation with a customizable dashboard displaying key metrics, upcoming jobs, urgent alerts, and revenue analytics.", points: ["At-a-glance business overview", "Real-time data synchronization", "Customizable widgets", "Proactive alerts & insights"] },
    { icon: Zap, title: "Workflow Automation", text: "Automate repetitive tasks such as follow-up emails, invoice generation, and scheduling reminders to save time and reduce manual errors.", points: ["Reduce administrative burden", "Ensure consistent processes", "Free up time for core tasks", "Improve operational efficiency"] },
  ];

  const businessTypes = [
    {
      icon: Star,
      title: "Solo Cleaning Professionals",
      description: "Maximize your efficiency and impress clients with professional tools. Manage bookings, send reminders, and get paid, all in one place, allowing you to focus on delivering sparkling service.",
      benefits: ["Easy Online Booking", "Automated Reminders", "Simple Invoicing", "Client Preference Tracking"]
    },
    {
      icon: Users,
      title: "Small to Medium Teams",
      description: "Coordinate your team effortlessly. Assign jobs, track progress, optimize schedules, and ensure consistent quality as your team grows. Empower your staff with mobile access to job details.",
      benefits: ["Team Scheduling & Dispatch", "Job Progress Tracking", "Centralized Client Communication", "Performance Insights"]
    },
    {
      icon: Grid2x2,
      title: "Expanding Cleaning Businesses",
      description: "Scale your operations smoothly with robust features designed for growth. Manage multiple locations, onboard new staff, analyze business performance, and automate workflows to handle increasing demand.",
      benefits: ["Multi-Location Management", "Advanced Reporting & Analytics", "Workflow Automation", "Scalable Client Database"]
    }
  ];

  const comparisonTableItems = [
    { name: "Industry-Specific Workflows", sweeply: true, generic: false, manual: false },
    { name: "Detailed Client Preferences Tracking", sweeply: true, generic: false, manual: false },
    { name: "Advanced Team Scheduling & Dispatch", sweeply: true, generic: true, manual: false },
    { name: "Branded Client Self-Service Portal", sweeply: true, generic: false, manual: false },
    { name: "Cleaning-Specific Reporting & Analytics", sweeply: true, generic: false, manual: false },
    { name: "Automated Client Reminders (SMS/Email)", sweeply: true, generic: true, manual: false },
    { name: "Dedicated Mobile App for Cleaners", sweeply: true, generic: false, manual: false },
    { name: "Integrated Online Payment Processing", sweeply: true, generic: false, manual: false },
    { name: "AI-Powered Route Optimization", sweeply: true, generic: false, manual: false },
    { name: "Customer Feedback & Rating System", sweeply: true, generic: false, manual: false }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sweeply-light via-white to-white overflow-x-hidden">
      {/* Hero Section with Interactive Animated Background */}
      <section className="relative bg-sweeply overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-sweeply to-sweeply-dark opacity-90"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-40 right-40 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
        
        {/* Diagonal white shape overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-white transform -skew-y-3 origin-bottom-right translate-y-16"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in delay-100">
            Unlock Peak Efficiency for Your Cleaning Business
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-3xl mx-auto animate-fade-in delay-200">
            Sweeply provides a comprehensive suite of powerful, intuitive features designed to streamline every aspect of your cleaning operations, delight customers, and fuel sustainable growth.
          </p>
          <Button className="bg-white text-sweeply hover:bg-white/90" asChild>
            <a href="https://sweeply.com/trial" target="_blank" rel="noopener noreferrer">Start Your Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Interactive Feature Carousel */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-sweeply-dark mb-5">Core Features That Transform Your Operations</h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-10">
              Our platform is built specifically for cleaning businesses, with powerful tools that streamline your daily operations.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {features.map((feature, index) => (
                <Button 
                  key={index}
                  variant={activeFeature === index ? "default" : "outline"}
                  className={`${activeFeature === index ? 'bg-sweeply text-white' : 'border-sweeply text-sweeply'} transition-all duration-300`}
                  onClick={() => setActiveFeature(index)}
                >
                  {feature.title.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-16">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-xl shadow-lg items-start transition-all duration-500 transform 
                  ${activeFeature === index ? 'scale-100 opacity-100' : 'scale-95 opacity-0 absolute invisible'}
                  ${index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  position: activeFeature === index ? 'relative' : 'absolute'
                }}
              >
                <div className="flex-shrink-0">
                  <div className="bg-sweeply/10 p-5 rounded-xl h-28 w-28 flex items-center justify-center ring-2 ring-sweeply/20">
                    <feature.icon className="w-14 h-14 text-sweeply" />
                  </div>
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-2xl lg:text-3xl font-semibold text-sweeply-dark mb-5">{feature.title}</h2>
                  <ul className="space-y-3 text-gray-600 mb-6">
                    {feature.descriptionPoints.map((point, pIndex) => (
                      <li key={pIndex} className="flex items-start animate-fade-in" style={{ animationDelay: `${(pIndex * 50) + 300}ms` }}>
                        <Check className="w-5 h-5 text-sweeply mr-3 mt-1 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Card className="bg-white shadow-sm mt-6 border border-sweeply/20 animate-fade-in" style={{ animationDelay: '600ms' }}>
                    <CardContent className="p-6">
                      <p className="italic text-gray-700 leading-relaxed">{feature.quote}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center mt-8">
              <Button 
                variant="ghost" 
                className="text-sweeply hover:text-sweeply-dark flex items-center gap-2"
                onClick={() => setActiveFeature((activeFeature + 1) % features.length)}
              >
                View Next Feature <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid with hover effects */}
      <section className="py-20 md:py-24 bg-sweeply-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-sweeply-dark mb-16 animate-fade-in">
            Comprehensive Feature Set
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feat, idx) => (
              <Card key={idx} className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl flex flex-col animate-fade-in hover:scale-105 hover:bg-sweeply/5" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardContent className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center mb-6">
                    <div className="bg-sweeply/10 p-4 rounded-full inline-flex mr-4 ring-1 ring-sweeply/10">
                      <feat.icon className="w-7 h-7 text-sweeply" />
                    </div>
                    <h3 className="text-xl font-semibold text-sweeply-dark">{feat.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-5 text-sm leading-relaxed flex-grow">
                    {feat.text}
                  </p>
                  <ul className="text-gray-600 space-y-2 text-sm mt-auto">
                    {feat.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center transform transition-transform duration-300 hover:translate-x-2">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /> 
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tailored for Your Success Section with interactive cards */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-sweeply-dark mb-6 animate-fade-in">
            Solutions Tailored for Every Cleaning Business
          </h2>
          <p className="text-center text-gray-700 max-w-2xl mx-auto mb-16 text-lg animate-fade-in delay-100">
            Whether you're a solo entrepreneur or a growing agency, Sweeply adapts to your unique needs and helps you succeed.
          </p>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {businessTypes.map((type, index) => (
              <Card key={index} className="bg-sweeply-light/30 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 rounded-xl flex flex-col border border-sweeply/20 animate-fade-in hover:scale-105 group" style={{ animationDelay: `${index * 150}ms` }}>
                <CardHeader className="items-center text-center pt-8">
                  <div className="bg-sweeply/10 p-5 rounded-full inline-flex mb-5 ring-2 ring-sweeply/20 group-hover:bg-sweeply/30 transition-all duration-300">
                    <type.icon className="w-10 h-10 text-sweeply" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-sweeply-dark">{type.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2 flex flex-col flex-grow items-center text-center">
                  <p className="text-gray-700 mb-6 text-sm leading-relaxed flex-grow">
                    {type.description}
                  </p>
                  <ul className="text-gray-600 space-y-2 text-sm mt-auto">
                    {type.benefits.map((benefit, bIndex) => (
                      <li key={bIndex} className="flex items-center transform transition-all duration-300 group-hover:translate-x-1">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 group-hover:text-sweeply transition-colors duration-300" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Feature Comparison */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-sweeply-dark mb-6 animate-fade-in">
            Sweeply vs. The Alternatives
          </h2>
          <p className="text-center text-gray-700 max-w-2xl mx-auto mb-16 text-lg animate-fade-in delay-100">
            See why a specialized platform like Sweeply outperforms generic tools and manual methods for cleaning businesses.
          </p>
          
          <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-200 bg-white animate-fade-in delay-200">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-sweeply-light/70">
                  <th className="p-5 text-left text-sm font-semibold text-sweeply-dark uppercase tracking-wider">Feature Comparison</th>
                  <th className="p-5 text-center text-sm font-semibold text-sweeply-dark uppercase tracking-wider">Sweeply</th>
                  <th className="p-5 text-center text-sm font-semibold text-sweeply-dark uppercase tracking-wider">Generic Software</th>
                  <th className="p-5 text-center text-sm font-semibold text-sweeply-dark uppercase tracking-wider">Manual Methods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonTableItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-300 text-sm animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                    <td className="p-4 text-center">
                      {item.sweeply ? 
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-500 animate-fade-in" />
                        </div> : 
                        <span className="text-red-500 text-lg">×</span>
                      }
                    </td>
                    <td className="p-4 text-center">{item.generic ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-red-500 text-lg">×</span>}</td>
                    <td className="p-4 text-center">{item.manual ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-red-500 text-lg">×</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with floating gradient */}
      <section className="relative py-20 md:py-28 bg-sweeply text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">Ready to Streamline Your Cleaning Business?</h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90 animate-fade-in delay-100">
            Try Sweeply free for 14 days. No credit card required. Unlock efficiency and growth today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-sweeply text-white hover:bg-sweeply-dark" asChild>
              <a href="https://sweeply.com/trial" target="_blank" rel="noopener noreferrer">Start Free Trial</a>
            </Button>
            <Button size="lg" className="bg-transparent border-2 border-white hover:bg-white/10 text-white px-10 py-3 animate-fade-in delay-300">
              <Link to="/contact">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
