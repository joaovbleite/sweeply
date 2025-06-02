import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  gradient: string;
  backgroundImage?: string;
}

const testimonials: TestimonialProps[] = [{
  content: "Atlas transformed our production line, handling repetitive tasks while our team focuses on innovation. 30% increase in output within three months.",
  author: "Sarah Chen",
  role: "VP of Operations, Axion Manufacturing",
  gradient: "from-blue-700 via-indigo-800 to-purple-900",
  backgroundImage: "/background-section1.png"
}, {
  content: "Implementing Atlas in our fulfillment centers reduced workplace injuries by 40% while improving order accuracy. The learning capabilities are remarkable.",
  author: "Michael Rodriguez",
  role: "Director of Logistics, GlobalShip",
  gradient: "from-indigo-900 via-purple-800 to-orange-500",
  backgroundImage: "/background-section2.png"
}, {
  content: "Atlas adapted to our lab protocols faster than any system we've used. It's like having another researcher who never gets tired and maintains perfect precision.",
  author: "Dr. Amara Patel",
  role: "Lead Scientist, BioAdvance Research",
  gradient: "from-purple-800 via-pink-700 to-red-500",
  backgroundImage: "/background-section3.png"
}, {
  content: "As a mid-size business, we never thought advanced robotics would be accessible to us. Atlas changed that equation entirely with its versatility and ease of deployment.",
  author: "Jason Lee",
  role: "CEO, Innovative Solutions Inc.",
  gradient: "from-orange-600 via-red-500 to-purple-600",
  backgroundImage: "/background-section1.png"
}];

const TestimonialCard = ({
  content,
  author,
  role,
  backgroundImage = "/background-section1.png"
}: TestimonialProps) => {
  return (
    <div 
      className="bg-cover bg-center rounded-lg p-6 sm:p-8 h-full flex flex-col justify-between text-white transform transition-transform duration-300 hover:-translate-y-2 relative overflow-hidden" 
      style={{
        backgroundImage: `url('${backgroundImage}')`
      }}
    >
      <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 bg-white z-10"></div>
      
      <div className="relative z-0">
        <p className="text-base sm:text-xl mb-4 sm:mb-8 font-medium leading-relaxed pr-12 sm:pr-20">{`"${content}"`}</p>
        <div>
          <h4 className="font-semibold text-lg sm:text-xl">{author}</h4>
          <p className="text-white/80 text-sm sm:text-base">{role}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
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
      const cardWidth = clientWidth * 0.85; // 85% of viewport
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, testimonials.length - 1));
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
    <section className="py-12 bg-white relative" id="testimonials" ref={sectionRef}>
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="flex items-center gap-4 mb-6">
          <div className="pulse-chip">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">04</span>
            <span>Testimonials</span>
          </div>
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-display font-bold mb-8 sm:mb-12 text-left">What others say</h2>
        
        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="pl-4"></div> {/* Left padding */}
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="flex-none w-[85%] pr-4 snap-start"
              >
                <TestimonialCard 
                  content={testimonial.content} 
                  author={testimonial.author} 
                  role={testimonial.role} 
                  gradient={testimonial.gradient} 
                  backgroundImage={testimonial.backgroundImage} 
                />
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
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
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
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={index} 
              content={testimonial.content} 
              author={testimonial.author} 
              role={testimonial.role} 
              gradient={testimonial.gradient} 
              backgroundImage={testimonial.backgroundImage} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
