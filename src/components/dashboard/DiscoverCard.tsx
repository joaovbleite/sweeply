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
      className="relative aspect-square rounded-2xl overflow-hidden block group transition-transform duration-200 ease-in-out hover:scale-105"
    >
      <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3 className="text-white text-base font-semibold">{title}</h3>
        <p className="text-white/70 text-sm">{subtitle}</p>
        <div className="absolute bottom-4 right-4">
          <button className="bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
            {actionText}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </a>
  );
};

export default DiscoverCard; 