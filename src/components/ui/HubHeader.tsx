import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HubHeaderProps {
  title: string;
  backLink?: string;
  rightElement?: React.ReactNode;
}

const HubHeader: React.FC<HubHeaderProps> = ({ title, backLink, rightElement }) => {
  return (
    <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-sm">
      <div className="px-4 pt-2 pb-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          {backLink && (
            <Link to={backLink} className="mr-2">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
          )}
          <h1 className="text-2xl font-bold text-[#1a2e35]">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </div>
  );
};

export default HubHeader;
