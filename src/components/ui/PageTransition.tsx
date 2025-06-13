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
  
  // Check if we're navigating between main tabs
  const isMainTabNavigation = () => {
    const mainPaths = ['/dashboard', '/schedule', '/clients', '/more'];
    return mainPaths.includes(prevPathRef.current) && mainPaths.includes(location.pathname);
  };
  
  // Determine if navigation is forward or backward
  // POP means backward navigation (browser back button or programmatic history.back())
  // PUSH or REPLACE is forward navigation
  const isBackwardNavigation = navigationType === 'POP';
  
  useEffect(() => {
    // Only apply animations if pathname has changed
    if (prevPathRef.current === location.pathname) {
      return;
    }
    
    // If navigating between main tabs, use minimal or no animation
    if (isMainTabNavigation()) {
      setDisplayChildren(children);
      prevPathRef.current = location.pathname;
      return;
    }
    
    // Update the previous path
    prevPathRef.current = location.pathname;
    
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
        }, 250); // Reduced from 400ms to 250ms for faster entrance
        
        return () => clearTimeout(enterTimer);
      }, 200); // Reduced from 300ms to 200ms for faster exit
      
      return () => clearTimeout(exitTimer);
    } else {
      // On desktop, just update children without animation
      setDisplayChildren(children);
    }
  }, [children, location.pathname, isMobile, navigationType]);
  
  // Don't apply animation if not on mobile
  if (!isMobile) {
    return <>{children}</>;
  }
  
  // Determine the animation classes based on navigation direction
  const getExitAnimationClass = () => {
    if (!isExiting) return '';
    if (isMainTabNavigation()) return 'opacity-100'; // No animation for tab navigation
    return isBackwardNavigation ? 'animate-exit-slide-down-fast' : 'animate-exit-slide-up-fast';
  };
  
  const getEntranceAnimationClass = () => {
    if (!isAnimating) return 'opacity-100';
    if (isMainTabNavigation()) return 'opacity-100'; // No animation for tab navigation
    return isBackwardNavigation ? 'animate-fade-slide-down-fast' : 'animate-fade-slide-up-fast';
  };
  
  return (
    <div
      className="w-full h-full overflow-hidden"
      style={{ 
        isolation: "isolate",
        position: "relative"
      }}
    >
      <div
        className={`w-full h-full ${getExitAnimationClass()} ${getEntranceAnimationClass()}`}
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform, opacity"
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
};

export default PageTransition; 