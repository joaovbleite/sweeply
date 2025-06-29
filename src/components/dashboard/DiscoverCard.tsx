import React from 'react';
import { ArrowRight } from 'lucide-react';

interface DiscoverCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  actionText: string;
  actionLink: string;
}

const DiscoverCard: React.FC<DiscoverCardProps> = ({ imageSrc, title, subtitle, actionText, actionLink }) => {
  return (
    <a
      href={actionLink}
      className="relative aspect-square rounded-2xl overflow-hidden block"
    >
      {/* Background image without zoom effect */}
      <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-full object-cover" 
      />
      
      {/* Dual gradient - from top and bottom for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60"></div>
      
      {/* Title and subtitle at the top */}
      <div className="absolute top-0 left-0 pt-5 px-4 w-full">
        <h3 className="text-white text-sm font-bold leading-tight mb-1 drop-shadow-sm">{title}</h3>
        <p className="text-white/90 text-xs leading-tight max-w-[90%] drop-shadow-sm">{subtitle}</p>
      </div>
      
      {/* Action button at the bottom */}
      <div className="absolute bottom-4 right-4">
        <button className="bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm transition-colors">
          {actionText}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </a>
  );
};

export default DiscoverCard; 