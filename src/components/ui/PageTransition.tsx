import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  
  useEffect(() => {
    if (isMobile) {
      // Start animation with current children
      setIsAnimating(true);
      
      // Update the children immediately to ensure content is ready
      setDisplayChildren(children);
      
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 250); // Match this with the CSS transition duration (0.25s)
      
      return () => clearTimeout(timer);
    } else {
      // On desktop, just update children without animation
      setDisplayChildren(children);
    }
  }, [children, location.pathname, isMobile]);
  
  // Don't apply animation if not on mobile
  if (!isMobile) {
    return <>{children}</>;
  }
  
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ 
        isolation: "isolate",
        position: "relative"
      }}
    >
      <div
        className={`w-full h-full ${
          isAnimating ? "animate-slide-up" : ""
        }`}
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden"
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
};

export default PageTransition; 