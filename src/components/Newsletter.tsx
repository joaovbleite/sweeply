import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const statsData = [
  {
    value: "87%",
    title: "Faster Invoicing",
    description: "Average time saved on billing and payment tracking",
    color: "blue"
  },
  {
    value: "3.2x",
    title: "Business Growth",
    description: "Average revenue increase within 6 months",
    color: "green"
  },
  {
    value: "15hrs",
    title: "Weekly Time Savings",
    description: "Less admin work, more time for cleaning and clients",
    color: "orange"
  }
];

const BusinessStats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Handle scroll for mobile carousel
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Update active index based on scroll position
      const cardWidth = clientWidth * 0.8; // 80% of viewport
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, statsData.length - 1));
    }
  };
  
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  return (
    <section id="business-stats" className="bg-white py-0" ref={sectionRef}>
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="pulse-chip">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">05</span>
              <span>Impact</span>
            </div>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-display font-bold mb-3 sm:mb-4 text-left">Proven business results</h2>
          <p className="text-base sm:text-xl text-gray-700 mb-6 sm:mb-10 text-left">
            See how Sweeply transforms cleaning businesses across the country
          </p>
          
          {/* Mobile carousel */}
          <div className="md:hidden relative">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="pl-4"></div> {/* Left padding */}
              {statsData.map((stat, index) => (
                <div 
                  key={index} 
                  className="flex-none w-[80%] pr-4 snap-start"
                >
                  <div className={`text-center p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200 h-full`}>
                    <div className={`text-3xl sm:text-4xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{stat.title}</div>
                    <div className="text-sm sm:text-base text-gray-600">{stat.description}</div>
                  </div>
                </div>
              ))}
              <div className="pr-4"></div> {/* Right padding */}
            </div>
            
            {/* Scroll indicators and controls */}
            <div className="flex justify-center items-center mt-4 gap-3">
              <button 
                onClick={scrollLeft} 
                className={`rounded-full p-2 transition ${showLeftButton ? 'bg-pulse-50 text-pulse-500' : 'bg-gray-100 text-gray-300'}`}
                disabled={!showLeftButton}
                aria-label="Previous stat"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex space-x-2">
                {statsData.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full transition-colors ${index === activeIndex ? 'bg-pulse-500' : 'bg-gray-200'}`}
                  ></div>
                ))}
              </div>
              <button 
                onClick={scrollRight} 
                className={`rounded-full p-2 transition ${showRightButton ? 'bg-pulse-50 text-pulse-500' : 'bg-gray-100 text-gray-300'}`}
                disabled={!showRightButton}
                aria-label="Next stat"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Desktop grid layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {statsData.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center p-6 rounded-2xl bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 border border-${stat.color}-200`}
              >
                <div className={`text-4xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{stat.title}</div>
                <div className="text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessStats;