import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HubHeaderProps {
  title: string;
  backLink?: string;
}

const HubHeader: React.FC<HubHeaderProps> = ({ title, backLink }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white pt-safe">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {backLink && (
            <Link to={backLink} className="mr-2">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
          )}
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default HubHeader;
