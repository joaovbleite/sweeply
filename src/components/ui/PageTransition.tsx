import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType(); // 'POP', 'PUSH', or 'REPLACE'
  const isMobile = useIsMobile();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isExiting, setIsExiting] = useState(false);
  const prevPathRef = useRef<string>(location.pathname);
  
  // Determine if navigation is forward or backward
  // POP means backward navigation (browser back button or programmatic history.back())
  // PUSH or REPLACE is forward navigation
  const isBackwardNavigation = navigationType === 'POP';
  
  useEffect(() => {
    // Only apply animations if pathname has changed
    if (prevPathRef.current === location.pathname) {
      return;
    }
    
    // Update the previous path
    prevPathRef.current = location.pathname;
    
    if (isMobile) {
      // Update the children immediately but apply a fade animation
      setDisplayChildren(children);
      setIsAnimating(true);
      
      // Reset animation state after entrance animation completes
      const enterTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 200); // Shorter animation duration
      
      return () => clearTimeout(enterTimer);
    } else {
      // On desktop, just update children without animation
      setDisplayChildren(children);
    }
  }, [children, location.pathname, isMobile, navigationType]);
  
  // Don't apply animation if not on mobile
  if (!isMobile) {
    return <>{children}</>;
  }
  
  // Use a simple fade animation instead of slide animations
  const getAnimationClass = () => {
    if (!isAnimating) return 'opacity-100';
    return 'animate-pure-fade';
  };
  
  return (
    <div 
      className={`${getAnimationClass()} page-transition-container`}
      style={{
        isolation: 'isolate',
        position: 'relative',
        zIndex: 1,
        contain: 'content'
      }}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition; 