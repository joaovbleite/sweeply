
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PricingHeroProps {
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}

const PricingHero: React.FC<PricingHeroProps> = ({ isAnnual, setIsAnnual }) => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-pulse-500 to-pulse-700 text-white animate-on-scroll">
      <div className="section-container text-center">
        <div className="pulse-chip mx-auto mb-4 sm:mb-6 bg-white/20 text-white border-white/30">
          <span>Pricing</span>
        </div>
        <h1 className="section-title !text-white mb-4 sm:mb-6">
          Choose Your Sweeply Plan
        </h1>
        <p className="section-subtitle !text-pulse-100 max-w-2xl mx-auto mb-8 sm:mb-10">
          Scale your cleaning business with the right tools. Simple, transparent pricing to fit your needs.
        </p>
        <div className="flex items-center justify-center space-x-3">
          <Label htmlFor="billing-cycle" className="text-lg font-medium text-pulse-100">
            Monthly
          </Label>
          <Switch
            id="billing-cycle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-pulse-400"
          />
          <Label htmlFor="billing-cycle" className="text-lg font-medium text-pulse-100 relative">
            Annually
            {isAnnual && (
              <span className="absolute -top-5 -right-2 text-xs bg-orange-500 text-white px-2 py-1 rounded-md whitespace-nowrap transform transition-all duration-300 animate-fade-in">
                Save 15%
              </span>
            )}
          </Label>
        </div>
      </div>
    </section>
  );
};

export default PricingHero;
