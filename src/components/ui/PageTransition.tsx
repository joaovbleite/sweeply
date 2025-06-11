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
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    if (isMobile) {
      // Start exit animation
      setIsExiting(true);
      
      // Wait for exit animation to complete before updating content
      const exitTimer = setTimeout(() => {
        // Update the children after exit animation
        setDisplayChildren(children);
        setIsExiting(false);
        // Start entrance animation
        setIsAnimating(true);
        
        // Reset animation state after entrance animation completes
        const enterTimer = setTimeout(() => {
          setIsAnimating(false);
        }, 300); // Entrance animation duration (0.3s)
        
        return () => clearTimeout(enterTimer);
      }, 200); // Exit animation duration (0.2s)
      
      return () => clearTimeout(exitTimer);
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
        className={`w-full h-full transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0' : ''}
          ${isAnimating ? 'animate-pure-fade' : 'opacity-100'}
        `}
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