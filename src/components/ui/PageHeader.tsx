import React, { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  backUrl?: string;
  rightElement?: ReactNode;
  onBackClick?: () => void;
  compact?: boolean;
}

/**
 * Standardized page header component with consistent spacing and styling
 * 
 * @param title - The page title
 * @param backUrl - URL to navigate to when back button is clicked (if provided, creates a Link)
 * @param rightElement - Optional element to display on the right side of the header
 * @param onBackClick - Optional callback for back button (used if backUrl is not provided)
 * @param compact - If true, uses reduced spacing
 */
const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  backUrl, 
  rightElement,
  onBackClick,
  compact = false
}) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (!backUrl) {
      navigate(-1);
    }
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
      <div className={`flex items-center justify-between px-4 border-b border-gray-200 ${compact ? 'pt-2 pb-2' : 'pt-8 pb-4'}`}>
        <div className="flex items-center">
          {backUrl ? (
            <Link to={backUrl} className="mr-2 text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </Link>
          ) : (
            <button 
              onClick={handleBackClick} 
              className="mr-2 text-gray-600"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-[#1a2e35]">
            {title}
          </h1>
        </div>
        {rightElement && (
          <div>{rightElement}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader; 