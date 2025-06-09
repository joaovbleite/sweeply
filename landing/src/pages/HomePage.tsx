import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Zap, Users, DollarSign, CheckCircle, Calendar, Shield, TrendingUp, Star, FileText, List, MessageSquare, Grid2x2 as IconGrid2x2, Check, Phone, BarChart2, ArrowRight, Quote, UserCheck, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const HomePage = () => {
  const featureCards = [
    { icon: Zap, title: "Streamlined Operations", description: "Efficiently manage bookings, client details, team schedules, and invoicing all in one place, significantly reducing administrative overhead." },
    { icon: Users, title: "Enhanced Client Satisfaction", description: "Provide a seamless booking experience, transparent communication, and consistently high-quality service to build loyalty and delight your customers." },
    { icon: DollarSign, title: "Sustainable Business Growth", description: "Focus on delivering exceptional cleaning services while Sweeply handles the operational complexities, empowering you to scale your business effectively." }
  ];

  const achieveResultsItems = [
    { icon: TrendingUp, title: "Boost Productivity", description: "Automate routine tasks, optimize schedules, and streamline workflows to free up valuable time for strategic growth and service delivery." },
    { icon: DollarSign, title: "Increase Profitability", description: "Reduce operational costs, minimize no-shows with automated reminders, and accelerate cash flow with integrated invoicing and payment processing." },
    { icon: Star, title: "Elevate Client Experience", description: "Deliver consistent, top-tier service with easy online booking, clear communication channels, and personalized client preference management." }
  ];

  const howItWorksSteps = [
    { number: 1, title: "Create Your Account", description: "Sign up in minutes and customize your dashboard to fit your cleaning business needs." },
    { number: 2, title: "Add Your Services", description: "Set up your cleaning services, pricing, and availability for clients to book." },
    { number: 3, title: "Start Managing Jobs", description: "Begin accepting bookings, assigning cleaners, and growing your business." }
  ];

  const testimonials = [
    { quote: "\"Since using Sweeply, I've been able to focus on cleaning instead of paperwork. My schedule is always full, and my clients love how easy it is to book.\"", author: "Sarah J.", role: "Solo Cleaner, Boston" },
    { quote: "\"Managing my team of 5 cleaners used to be a nightmare. Sweeply has streamlined everything from scheduling to payments, and we've grown 30% this year alone.\"", author: "Michael R.", role: "Cleaning Company Owner, Chicago" },
    { quote: "\"Sweeply's customer support is top-notch. They helped me set everything up and are always responsive to my questions. Highly recommend!\"", author: "Linda K.", role: "Small Cleaning Business Owner, San Diego" },
    { quote: "\"The mobile app is a lifesaver for my team on the go. They can see their schedules, job details, and mark tasks as complete in real-time.\"", author: "David P.", role: "Operations Manager, BrightClean Co." }
  ];

  const keyBenefits = [
    { icon: Calendar, title: "Intelligent Scheduling", description: "Maximize your team's efficiency with AI-powered route optimization, real-time availability tracking, and automated dispatch. Eliminate double bookings and reduce travel time, allowing for more jobs per day." },
    { icon: Users, title: "Comprehensive Client Management", description: "Build lasting relationships with a 360-degree view of every client. Store detailed profiles, service history, specific preferences (e.g., 'pet-friendly'), and communication logs in one secure, easily accessible hub." },
    { icon: DollarSign, title: "Simplified Payments & Invoicing", description: "Get paid faster and reduce administrative headaches. Automate invoice generation, send professional custom-branded invoices, and offer secure online payment options directly through the client portal." },
    { icon: Shield, title: "Reliable Platform & Support", description: "Focus on your business with peace of mind. Sweeply offers a secure, scalable, and dependable platform, backed by our dedicated customer success team ready to assist you every step of the way." }
  ];

  const painPoints = [
    { icon: FileText, title: "Overwhelmed by Admin?", description: "Sweeply automates tedious tasks like scheduling, invoicing, and client communication, freeing up your time." },
    { icon: List, title: "Inefficient Scheduling?", description: "Optimize routes, manage staff availability, and prevent double-bookings with our smart scheduling tools." },
    { icon: MessageSquare, title: "Client Communication Gaps?", description: "Keep clients informed with automated reminders, updates, and a dedicated portal for seamless interaction." },
    { icon: IconGrid2x2, title: "Struggling to Scale?", description: "Our platform provides the structure and insights needed to manage growth, from client acquisition to team expansion." }
  ];

  const featureIcons = [
    { icon: Calendar, title: "Auto-scheduling", description: "Schedule recurring bookings automatically" },
    { icon: Users, title: "Team Access", description: "Manage teams with customized permissions" },
    { icon: Check, title: "Easy Booking", description: "Quick and simple appointment creation" },
    { icon: BarChart2, title: "Smart Analytics", description: "Insightful business performance data" },
  ];

  // Reference to the carousel component for automatic sliding
  const carouselRef = useRef(null);
  const autoplayIntervalRef = useRef(null);
  
  // Set up the automatic sliding effect
  useEffect(() => {
    const startAutoplay = () => {
      if (autoplayIntervalRef.current) return;
      
      autoplayIntervalRef.current = setInterval(() => {
        const carousel = document.querySelector('.testimonial-carousel');
        if (carousel && carousel.getAttribute('data-pause') !== 'true') {
          const nextButton = carousel.querySelector('[data-carousel-next]') as HTMLElement;
          if (nextButton) {
            nextButton.click();
          }
        }
      }, 4000); // Slide every 4 seconds
    };
    
    const stopAutoplay = () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
    
    // Start the autoplay
    startAutoplay();
    
    // Clean up on component unmount
    return () => {
      stopAutoplay();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sweeply-light via-white to-white overflow-x-hidden">
      {/* New Hero Section inspired by the image */}
      <section className="relative bg-sweeply overflow-hidden pt-16 pb-36 md:pb-48 lg:pb-64">
        <div className="absolute inset-0 bg-gradient-to-br from-sweeply to-sweeply-dark opacity-90"></div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-white transform -skew-y-3 origin-bottom-right translate-y-16"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left lg:pr-8 mb-8 sm:mb-12 lg:mb-0 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              The <span className="text-white font-extrabold">Ultimate</span> Tool to <span className="text-white font-extrabold">Manage & Grow</span> Your Cleaning Business
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-10 max-w-xl">
              Simplify how you schedule, manage, and grow your cleaning business with our all-in-one platform designed for cleaning professionals.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in delay-300">
              <Button className="bg-sweeply hover:bg-sweeply-dark text-white text-sm sm:text-base" size="lg" asChild>
                <a href="https://sweeply.com/trial" target="_blank" rel="noopener noreferrer">Try Sweeply For 14 Days</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-6 sm:px-10 py-2 sm:py-3 text-sm sm:text-base">
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center animate-scale-in delay-200">
            <div className="relative">
              <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white animate-phone-float">
                <img 
                  src="/photo-1486312338219-ce68d2c6f44d.jpg" 
                  alt="Sweeply platform on a mobile device showing dashboard" 
                  className="rounded-2xl transform transition-transform duration-300 hover:scale-105 w-full"
                  style={{ maxWidth: '300px', margin: '0 auto' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Why Cleaning Business Owners Love Sweeply - Integrated into Hero */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 lg:mt-28 relative z-10">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Why Cleaning Business Owners Love Sweeply</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featureIcons.map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-3 sm:p-5 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-300 animate-fade-in hover:scale-105 shadow-lg" 
                style={{ animationDelay: `${400 + (index + 1) * 150}ms` }}
              >
                <div className="bg-white/20 p-2.5 sm:p-3.5 rounded-full mb-3 sm:mb-5 ring-1 ring-white/25">
                  <item.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-sm sm:text-md font-semibold text-white mb-1 sm:mb-1.5">{item.title}</h3>
                <p className="text-xs font-medium text-white/80 leading-relaxed px-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 sm:py-16 bg-white animate-fade-in delay-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 sm:mb-8">Trusted by cleaning businesses nationwide</h2>
          <div className="flex flex-wrap justify-center gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-8 items-center opacity-90">
            {["COMPANY A", "CLEANCO LLC", "PROSPARKLE", "SERVICE MASTERS INC.", "HOMECLEAN HEROES"].map(company => (
              <div key={company} className="text-sm sm:text-lg font-semibold text-gray-600 hover:text-sweeply transition-colors">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Solved Section */}
      <section id="pain-points" className="py-12 sm:py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-sweeply-dark mb-3 sm:mb-5">Stop Juggling, Start Thriving</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto">
              Running a cleaning business comes with unique challenges. Sweeply is designed to solve them, so you can focus on what you do best.
            </p>
          </div>
          
          {/* Mobile carousel / Desktop grid */}
          <div className="sm:hidden relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {painPoints.map((point, index) => (
                  <CarouselItem key={index} className="pl-2 basis-3/4">
                    <Card className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-center animate-fade-in hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="bg-sweeply/10 p-3 rounded-full inline-flex mb-4">
                          <point.icon className="w-7 h-7 text-sweeply" />
                        </div>
                        <h3 className="text-lg font-semibold text-sweeply-dark mb-2">{point.title}</h3>
                        <p className="text-gray-600 text-xs leading-relaxed flex-grow">{point.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4 gap-2">
                <CarouselPrevious className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9" />
                <CarouselNext className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9" />
              </div>
            </Carousel>
          </div>
          
          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {painPoints.map((point, index) => (
              <Card key={index} className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-center animate-fade-in hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-4 sm:p-8 flex flex-col items-center">
                  <div className="bg-sweeply/10 p-3 sm:p-4 rounded-full inline-flex mb-4 sm:mb-6">
                    <point.icon className="w-7 h-7 sm:w-10 sm:h-10 text-sweeply" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-sweeply-dark mb-2 sm:mb-3">{point.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-grow">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section id="features-overview" className="py-12 sm:py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-sweeply-dark mb-3 sm:mb-5">Why Sweeply is the Right Choice</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Our platform is meticulously designed to help cleaning businesses thrive by simplifying complex operations and enhancing customer relationships.
            </p>
          </div>
          
          {/* Mobile carousel */}
          <div className="md:hidden relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {featureCards.map((card, index) => (
                  <CarouselItem key={index} className="pl-2 basis-3/4">
                    <Card className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl animate-fade-in hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-4">
                        <div className="bg-sweeply/10 p-3 rounded-full inline-flex mb-4">
                          <card.icon className="w-6 h-6 text-sweeply" />
                        </div>
                        <h3 className="text-lg font-semibold text-sweeply-dark mb-2">{card.title}</h3>
                        <p className="text-gray-600 text-xs leading-relaxed">{card.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4 gap-2">
                <CarouselPrevious className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9" />
                <CarouselNext className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9" />
              </div>
            </Carousel>
          </div>
          
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 sm:gap-8">
            {featureCards.map((card, index) => (
              <Card key={index} className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl animate-fade-in hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-4 sm:p-8">
                  <div className="bg-sweeply/10 p-3 sm:p-4 rounded-full inline-flex mb-4 sm:mb-6">
                    <card.icon className="w-6 h-6 sm:w-8 sm:h-8 text-sweeply" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-sweeply-dark mb-2 sm:mb-3">{card.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-16 animate-fade-in delay-200">
            <Button variant="outline" size="lg" className="border-sweeply text-sweeply hover:bg-sweeply/10 px-6 sm:px-10 py-2 sm:py-3 text-sm sm:text-base">
              <Link to="/features">Learn More About Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Unlock Growth and Efficiency Section */}
      <section className="py-12 sm:py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-sweeply/5 to-blue-50 z-0"></div>
        <div className="absolute inset-y-0 right-0 w-1/3 bg-sweeply/5 skew-x-12 -mr-32 z-0"></div>
        <div className="absolute inset-0 z-0 overflow-hidden">
          <svg className="absolute top-0 left-0 transform -translate-y-1/2 -translate-x-1/4 opacity-20" width="600" height="600" viewBox="0 0 600 600" fill="none">
            <circle cx="300" cy="300" r="300" fill="url(#growth-gradient)" />
            <defs>
              <linearGradient id="growth-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0070F3" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#00C4FF" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-0 right-0 transform translate-y-1/3 translate-x-1/4 opacity-20" width="600" height="600" viewBox="0 0 600 600" fill="none">
            <circle cx="300" cy="300" r="300" fill="url(#growth-gradient-2)" />
            <defs>
              <linearGradient id="growth-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0070F3" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00C4FF" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-sweeply-dark mb-5">Unlock Growth and Efficiency</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Sweeply empowers you to achieve tangible results and take your cleaning business to the next level.
            </p>
          </div>
          
          {/* Mobile carousel */}
          <div className="md:hidden relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {achieveResultsItems.map((item, index) => (
                  <CarouselItem key={index} className="pl-2 basis-3/4">
                    <Card className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-center animate-fade-in hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="p-4 flex flex-col items-center">
                        <div className="bg-sweeply/10 p-3 rounded-full inline-flex mb-4">
                          <item.icon className="w-7 h-7 text-sweeply" />
                        </div>
                        <h3 className="text-lg font-semibold text-sweeply-dark mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-xs leading-relaxed">{item.description}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4 gap-2">
                <CarouselPrevious className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9" />
                <CarouselNext className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9" />
              </div>
            </Carousel>
          </div>
          
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {achieveResultsItems.map((item, index) => (
              <Card key={index} className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-center animate-fade-in hover:scale-105" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-8">
                  <div className="bg-sweeply/10 p-4 rounded-full inline-flex mb-6">
                    <item.icon className="w-10 h-10 text-sweeply" />
                  </div>
                  <h3 className="text-xl font-semibold text-sweeply-dark mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-sweeply-dark mb-3 sm:mb-5">How Sweeply Works</h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
              Our simple 3-step process gets you up and running quickly.
            </p>
          </div>
          
          {/* Mobile horizontal process with connecting lines */}
          <div className="md:hidden overflow-x-auto pb-4">
            <div className="flex min-w-max">
              {howItWorksSteps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center text-center p-3 w-64">
                    <div className="w-12 h-12 bg-sweeply rounded-full flex items-center justify-center text-white text-xl font-bold mb-4 shadow-md">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-sweeply-dark mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{step.description}</p>
                  </div>
                  {index < howItWorksSteps.length - 1 && (
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-sweeply" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-10">
            {howItWorksSteps.map((step, index) => (
              <div 
                key={step.number} 
                className="group flex flex-col items-center text-center p-6 animate-fade-in hover:scale-105 hover:shadow-xl transition-all duration-300 rounded-xl border border-transparent hover:border-sweeply/20" 
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-sweeply rounded-full flex items-center justify-center text-white text-2xl font-bold mb-8 shadow-md transition-all duration-300 group-hover:bg-sweeply-dark group-hover:text-white group-hover:ring-4 group-hover:ring-sweeply/30">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-sweeply-dark mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* REDESIGNED Testimonials Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 z-0"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-16 bg-sweeply/5 rounded-full opacity-60 blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-sweeply/10 rounded-full opacity-60 blur-3xl transform translate-y-1/3"></div>
          <svg className="absolute left-0 top-1/2 transform -translate-y-1/2 opacity-5" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="testimonial-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-sweeply" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#testimonial-pattern)" />
          </svg>
          <svg className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-5" width="404" height="784" fill="none" viewBox="0 0 404 784">
            <defs>
              <pattern id="testimonial-pattern-2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" className="text-sweeply" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="784" fill="url(#testimonial-pattern-2)" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center mb-8">
            <div className="inline-block p-2 px-4 rounded-full bg-sweeply/10 text-sweeply font-medium text-sm mb-4">
              CUSTOMER STORIES
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-sweeply-dark mb-6">
              Trusted by Cleaning Professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">
              Discover how Sweeply has revolutionized operations for cleaning businesses across the country.
            </p>
          </div>
          
          <Carousel
            ref={carouselRef}
            opts={{
              align: "start",
              loop: true,
            }}
            onMouseEnter={() => {
              const carousel = document.querySelector('.testimonial-carousel');
              carousel?.setAttribute('data-pause', 'true');
            }}
            onMouseLeave={() => {
              const carousel = document.querySelector('.testimonial-carousel');
              carousel?.setAttribute('data-pause', 'false');
            }}
            className="w-full testimonial-carousel"
          >
            <CarouselContent className="-ml-2 sm:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 sm:pl-4 basis-full xs:basis-2/3 sm:basis-1/2 lg:basis-1/3 transition-transform duration-500">
                  <div className="bg-gradient-to-br from-white to-gray-100 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all h-full flex flex-col">
                    <blockquote className="mb-4 flex-grow text-sm sm:text-base font-medium text-gray-700 italic">
                      {testimonial.quote}
                    </blockquote>
                    <footer className="flex items-center justify-start">
                      <div className="bg-sweeply/10 p-2 sm:p-3 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-sweeply" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm sm:text-base font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </footer>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="flex justify-center mt-4 sm:mt-6 gap-2">
              <CarouselPrevious className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9 sm:h-10 sm:w-10" data-carousel-prev />
              <CarouselNext className="relative static transform-none translate-x-0 translate-y-0 text-sweeply border-sweeply hover:bg-sweeply-light hover:text-sweeply-dark h-9 w-9 sm:h-10 sm:w-10" data-carousel-next />
            </div>
          </Carousel>
          
          <div className="mt-16 text-center">
            <Button variant="outline" className="border-sweeply text-sweeply hover:bg-sweeply/5 group transition-all duration-300">
              <span>Read More Success Stories</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* REDESIGNED Key Benefits Section */}
      <section className="py-16 sm:py-24 md:py-32 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sweeply/5 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sweeply/5 rounded-full"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center mb-16">
            <div>
              <div className="inline-block p-2 px-4 rounded-full bg-sweeply/10 text-sweeply font-medium text-sm mb-4">
                WHY CHOOSE SWEEPLY
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-sweeply-dark mb-4 sm:mb-6 leading-tight">
                Transform Your Cleaning Business with Powerful Tools
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Sweeply isn't just software; it's a complete business transformation platform designed specifically for cleaning professionals.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Button className="bg-sweeply hover:bg-sweeply-dark text-white text-sm sm:text-base">
                  <a href="https://sweeply.com/trial" target="_blank" rel="noopener noreferrer">Get Started Free</a>
                </Button>
                <Button variant="outline" className="border-sweeply text-sweeply hover:bg-sweeply/5 text-sm sm:text-base">
                  <Link to="/features">See All Features</Link>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-sweeply/10 to-sweeply/5 rounded-3xl transform rotate-3"></div>
              <img 
                src="/dashboard-mockup.jpg" 
                alt="Sweeply dashboard" 
                className="relative z-10 rounded-2xl shadow-2xl border-8 border-white transform -rotate-3 hover:rotate-0 transition-all duration-500"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/600x400/sweeply/white?text=Sweeply+Dashboard";
                }}
              />
            </div>
          </div>
          
          {/* Mobile scrollable benefits */}
          <div className="lg:hidden overflow-x-auto pb-4">
            <div className="grid grid-cols-2 min-w-max gap-6">
              {keyBenefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="group flex flex-col w-64 p-4"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-sweeply to-sweeply-dark rounded-2xl mb-4 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-sweeply-dark mb-2 group-hover:text-sweeply transition-colors duration-300">{benefit.title}</h3>
                  <p className="text-gray-600 text-xs">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop grid */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-x-8 gap-y-12 mt-20">
            {keyBenefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group flex flex-col"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-sweeply to-sweeply-dark rounded-2xl mb-6 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-sweeply-dark mb-3 group-hover:text-sweeply transition-colors duration-300">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REDESIGNED Call to Action Section */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sweeply to-sweeply-dark"></div>
        
        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-2 border border-white/20 shadow-2xl">
            <div className="bg-white/10 rounded-2xl p-6 sm:p-8 md:p-12 lg:p-16 text-center">
              <div className="flex justify-center mb-6 sm:mb-10">
                <div className="flex space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-8">
                Ready to Revolutionize Your Cleaning Business?
              </h2>
              <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-10 max-w-2xl mx-auto">
                Join thousands of cleaning professionals who are growing their businesses with Sweeply.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                <Button size="lg" className="bg-white hover:bg-gray-100 text-sweeply-dark font-bold py-3 sm:py-6 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex-1">
                  <a href="https://sweeply.com/trial" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/10 font-bold py-3 sm:py-6 text-base sm:text-lg rounded-xl transition-all duration-300 flex-1">
                  <Link to="/demo" className="flex items-center justify-center">
                    Schedule a Demo
                  </Link>
                </Button>
              </div>
              
              <p className="mt-6 sm:mt-8 text-white/80 text-xs sm:text-sm">
                No credit card required. 14-day free trial. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
