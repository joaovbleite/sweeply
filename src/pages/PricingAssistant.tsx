import React, { useState, useEffect, useMemo } from "react";
import { 
  Calculator, 
  DollarSign, 
  Home, 
  Building2, 
  Clock, 
  Users, 
  MapPin,
  TrendingUp,
  Lightbulb,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowRight,
  Plus,
  Minus,
  Save,
  Share,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";

const PricingAssistant = () => {
  const { t } = useTranslation(['pricing', 'common']);
  const { formatCurrency } = useLocale();
  
  // Pricing form state
  const [serviceType, setServiceType] = useState<'residential' | 'commercial'>('residential');
  const [cleaningType, setCleaningType] = useState<'regular' | 'deep_clean' | 'move_in' | 'move_out' | 'post_construction' | 'one_time'>('regular');
  const [propertySize, setPropertySize] = useState({
    sqft: '',
    bedrooms: '2',
    bathrooms: '2',
    floors: '1'
  });
  const [location, setLocation] = useState({
    zipCode: '',
    city: 'New York',
    state: 'NY'
  });
  const [additionalServices, setAdditionalServices] = useState({
    insideOven: false,
    insideFridge: false,
    insideWindows: false,
    laundry: false,
    dishes: false,
    organizing: false,
    petHairRemoval: false,
    deepCarpetCleaning: false
  });
  const [timeEstimate, setTimeEstimate] = useState('');
  const [teamSize, setTeamSize] = useState('1');
  const [urgency, setUrgency] = useState<'standard' | 'same_day' | 'next_day'>('standard');
  
  // Market data (simulated)
  const marketData = {
    'New York': { min: 25, max: 45, avg: 35, demand: 'high' },
    'Los Angeles': { min: 22, max: 40, avg: 31, demand: 'high' },
    'Chicago': { min: 18, max: 35, avg: 26, demand: 'medium' },
    'Houston': { min: 16, max: 30, avg: 23, demand: 'medium' },
    'Miami': { min: 20, max: 38, avg: 29, demand: 'high' },
    'Default': { min: 15, max: 30, avg: 22, demand: 'medium' }
  };

  // Calculate pricing
  const pricingCalculation = useMemo(() => {
    const market = marketData[location.city] || marketData['Default'];
    const sqft = parseInt(propertySize.sqft) || 1000;
    const bedrooms = parseInt(propertySize.bedrooms) || 2;
    const bathrooms = parseInt(propertySize.bathrooms) || 2;
    const floors = parseInt(propertySize.floors) || 1;
    const team = parseInt(teamSize) || 1;
    
    // Base pricing calculation
    let basePrice = 0;
    
    if (serviceType === 'residential') {
      // Residential pricing based on rooms and sqft
      basePrice = (bedrooms * 15) + (bathrooms * 20) + (sqft * 0.08) + (floors * 10);
    } else {
      // Commercial pricing based on sqft
      basePrice = sqft * 0.12;
    }
    
    // Service type multipliers
    const serviceMultipliers = {
      regular: 1.0,
      deep_clean: 1.8,
      move_in: 1.6,
      move_out: 1.7,
      post_construction: 2.2,
      one_time: 1.2
    };
    
    basePrice *= serviceMultipliers[cleaningType];
    
    // Additional services
    const additionalCosts = {
      insideOven: 25,
      insideFridge: 20,
      insideWindows: 30,
      laundry: 15,
      dishes: 10,
      organizing: 40,
      petHairRemoval: 20,
      deepCarpetCleaning: 50
    };
    
    let additionalTotal = 0;
    Object.entries(additionalServices).forEach(([service, selected]) => {
      if (selected) {
        additionalTotal += additionalCosts[service] || 0;
      }
    });
    
    // Team size adjustment
    if (team > 1) {
      basePrice *= (1 + (team - 1) * 0.7); // Each additional person adds 70% of base rate
    }
    
    // Urgency multipliers
    const urgencyMultipliers = {
      standard: 1.0,
      same_day: 1.5,
      next_day: 1.25
    };
    
    basePrice *= urgencyMultipliers[urgency];
    
    const totalPrice = basePrice + additionalTotal;
    
    // Calculate time estimate
    let estimatedHours = 0;
    if (serviceType === 'residential') {
      estimatedHours = (bedrooms * 0.5) + (bathrooms * 0.75) + (sqft / 500) + (floors * 0.25);
    } else {
      estimatedHours = sqft / 400;
    }
    
    estimatedHours *= serviceMultipliers[cleaningType];
    estimatedHours /= team; // Divide by team size
    
    // Add time for additional services
    const additionalTime = Object.entries(additionalServices).reduce((total, [service, selected]) => {
      if (selected) {
        const timeMap = {
          insideOven: 0.5,
          insideFridge: 0.25,
          insideWindows: 1.0,
          laundry: 0.5,
          dishes: 0.25,
          organizing: 1.5,
          petHairRemoval: 0.5,
          deepCarpetCleaning: 1.0
        };
        return total + (timeMap[service] || 0);
      }
      return total;
    }, 0);
    
    estimatedHours += additionalTime;
    
    // Market comparison
    const hourlyRate = totalPrice / estimatedHours;
    const marketPosition = hourlyRate < market.min ? 'low' : 
                          hourlyRate > market.max ? 'high' : 'competitive';
    
    return {
      basePrice,
      additionalTotal,
      totalPrice,
      estimatedHours: Math.max(1, estimatedHours),
      hourlyRate,
      market,
      marketPosition,
      recommendations: generateRecommendations(totalPrice, hourlyRate, market, marketPosition)
    };
  }, [serviceType, cleaningType, propertySize, location, additionalServices, teamSize, urgency]);

  const generateRecommendations = (price, hourlyRate, market, position) => {
    const recommendations = [];
    
    if (position === 'low') {
      recommendations.push({
        type: 'warning',
        title: t('pricing:priceTooLow'),
        message: t('pricing:priceTooLowDesc'),
        action: t('pricing:increasePrice')
      });
    } else if (position === 'high') {
      recommendations.push({
        type: 'info',
        title: t('pricing:priceHigh'),
        message: t('pricing:priceHighDesc'),
        action: t('pricing:justifyValue')
      });
    } else {
      recommendations.push({
        type: 'success',
        title: t('pricing:priceCompetitive'),
        message: t('pricing:priceCompetitiveDesc'),
        action: t('pricing:goodToGo')
      });
    }
    
    if (market.demand === 'high') {
      recommendations.push({
        type: 'success',
        title: t('pricing:highDemand'),
        message: t('pricing:highDemandDesc'),
        action: t('pricing:considerPremium')
      });
    }
    
    return recommendations;
  };

  const handleSaveQuote = () => {
    toast.success(t('pricing:quoteSaved'));
  };

  const handleShareQuote = () => {
    toast.success(t('pricing:quoteShared'));
  };

  const serviceTypeOptions = [
    { value: 'residential', label: t('pricing:residential'), icon: Home },
    { value: 'commercial', label: t('pricing:commercial'), icon: Building2 }
  ];

  const cleaningTypeOptions = [
    { value: 'regular', label: t('pricing:regularCleaning') },
    { value: 'deep_clean', label: t('pricing:deepCleaning') },
    { value: 'move_in', label: t('pricing:moveIn') },
    { value: 'move_out', label: t('pricing:moveOut') },
    { value: 'post_construction', label: t('pricing:postConstruction') },
    { value: 'one_time', label: t('pricing:oneTime') }
  ];

  const additionalServiceOptions = [
    { key: 'insideOven', label: t('pricing:insideOven'), price: 25 },
    { key: 'insideFridge', label: t('pricing:insideFridge'), price: 20 },
    { key: 'insideWindows', label: t('pricing:insideWindows'), price: 30 },
    { key: 'laundry', label: t('pricing:laundry'), price: 15 },
    { key: 'dishes', label: t('pricing:dishes'), price: 10 },
    { key: 'organizing', label: t('pricing:organizing'), price: 40 },
    { key: 'petHairRemoval', label: t('pricing:petHairRemoval'), price: 20 },
    { key: 'deepCarpetCleaning', label: t('pricing:deepCarpetCleaning'), price: 50 }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-pulse-500" />
            {t('pricing:pricingAssistant')}
          </h1>
          <p className="mt-1 text-gray-600">{t('pricing:calculateCompetitivePricing')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Type Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:serviceType')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {serviceTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setServiceType(option.value as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        serviceType === option.value
                          ? 'border-pulse-500 bg-pulse-50 text-pulse-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cleaning Type */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:cleaningType')}</h2>
              <select
                value={cleaningType}
                onChange={(e) => setCleaningType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                {cleaningTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:propertyDetails')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:squareFeet')}
                  </label>
                  <input
                    type="number"
                    value={propertySize.sqft}
                    onChange={(e) => setPropertySize(prev => ({ ...prev, sqft: e.target.value }))}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
                
                {serviceType === 'residential' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('pricing:bedrooms')}
                      </label>
                      <select
                        value={propertySize.bedrooms}
                        onChange={(e) => setPropertySize(prev => ({ ...prev, bedrooms: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('pricing:bathrooms')}
                      </label>
                      <select
                        value={propertySize.bathrooms}
                        onChange={(e) => setPropertySize(prev => ({ ...prev, bathrooms: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      >
                        {[1,1.5,2,2.5,3,3.5,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:floors')}
                  </label>
                  <select
                    value={propertySize.floors}
                    onChange={(e) => setPropertySize(prev => ({ ...prev, floors: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    {[1,2,3,4].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:location')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:city')}
                  </label>
                  <select
                    value={location.city}
                    onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Houston">Houston</option>
                    <option value="Miami">Miami</option>
                    <option value="Default">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:state')}
                  </label>
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:zipCode')}
                  </label>
                  <input
                    type="text"
                    value={location.zipCode}
                    onChange={(e) => setLocation(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:additionalServices')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalServiceOptions.map((service) => (
                  <label key={service.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={additionalServices[service.key]}
                        onChange={(e) => setAdditionalServices(prev => ({
                          ...prev,
                          [service.key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">{service.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-pulse-600">+{formatCurrency(service.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Team & Urgency */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:teamAndUrgency')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:teamSize')}
                  </label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? t('pricing:person') : t('pricing:people')}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:urgency')}
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    <option value="standard">{t('pricing:standard')}</option>
                    <option value="next_day">{t('pricing:nextDay')} (+25%)</option>
                    <option value="same_day">{t('pricing:sameDay')} (+50%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Results */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-pulse-500" />
                {t('pricing:priceBreakdown')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('pricing:basePrice')}</span>
                  <span className="font-medium">{formatCurrency(pricingCalculation.basePrice)}</span>
                </div>
                
                {pricingCalculation.additionalTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('pricing:additionalServices')}</span>
                    <span className="font-medium">{formatCurrency(pricingCalculation.additionalTotal)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('pricing:totalPrice')}</span>
                    <span className="text-pulse-600">{formatCurrency(pricingCalculation.totalPrice)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('pricing:estimatedTime')}</span>
                    <span className="font-medium">{pricingCalculation.estimatedHours.toFixed(1)} {t('pricing:hours')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">{t('pricing:hourlyRate')}</span>
                    <span className="font-medium">{formatCurrency(pricingCalculation.hourlyRate)}/hr</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveQuote}
                  className="w-full px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('pricing:saveQuote')}
                </button>
                
                <button
                  onClick={handleShareQuote}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  {t('pricing:shareQuote')}
                </button>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pulse-500" />
                {t('pricing:marketAnalysis')}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('pricing:marketRange')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pricingCalculation.market.demand === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pricingCalculation.market.demand === 'high' ? t('pricing:highDemand') : t('pricing:mediumDemand')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(pricingCalculation.market.min)} - {formatCurrency(pricingCalculation.market.max)}/hr
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('pricing:average')}: {formatCurrency(pricingCalculation.market.avg)}/hr
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  pricingCalculation.marketPosition === 'competitive' ? 'bg-green-50 border border-green-200' :
                  pricingCalculation.marketPosition === 'low' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {pricingCalculation.marketPosition === 'competitive' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : pricingCalculation.marketPosition === 'low' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {t('pricing:yourRate')}: {formatCurrency(pricingCalculation.hourlyRate)}/hr
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {pricingCalculation.marketPosition === 'competitive' && t('pricing:competitivePosition')}
                    {pricingCalculation.marketPosition === 'low' && t('pricing:belowMarket')}
                    {pricingCalculation.marketPosition === 'high' && t('pricing:aboveMarket')}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-pulse-500" />
                {t('pricing:aiRecommendations')}
              </h3>
              
              <div className="space-y-3">
                {pricingCalculation.recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    rec.type === 'success' ? 'bg-green-50 border-green-200' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                    <span className="text-sm font-medium text-pulse-600">{rec.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PricingAssistant; 
import { 
  Calculator, 
  DollarSign, 
  Home, 
  Building2, 
  Clock, 
  Users, 
  MapPin,
  TrendingUp,
  Lightbulb,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowRight,
  Plus,
  Minus,
  Save,
  Share,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";
import AppLayout from "@/components/AppLayout";

const PricingAssistant = () => {
  const { t } = useTranslation(['pricing', 'common']);
  const { formatCurrency } = useLocale();
  
  // Pricing form state
  const [serviceType, setServiceType] = useState<'residential' | 'commercial'>('residential');
  const [cleaningType, setCleaningType] = useState<'regular' | 'deep_clean' | 'move_in' | 'move_out' | 'post_construction' | 'one_time'>('regular');
  const [propertySize, setPropertySize] = useState({
    sqft: '',
    bedrooms: '2',
    bathrooms: '2',
    floors: '1'
  });
  const [location, setLocation] = useState({
    zipCode: '',
    city: 'New York',
    state: 'NY'
  });
  const [additionalServices, setAdditionalServices] = useState({
    insideOven: false,
    insideFridge: false,
    insideWindows: false,
    laundry: false,
    dishes: false,
    organizing: false,
    petHairRemoval: false,
    deepCarpetCleaning: false
  });
  const [timeEstimate, setTimeEstimate] = useState('');
  const [teamSize, setTeamSize] = useState('1');
  const [urgency, setUrgency] = useState<'standard' | 'same_day' | 'next_day'>('standard');
  
  // Market data (simulated)
  const marketData = {
    'New York': { min: 25, max: 45, avg: 35, demand: 'high' },
    'Los Angeles': { min: 22, max: 40, avg: 31, demand: 'high' },
    'Chicago': { min: 18, max: 35, avg: 26, demand: 'medium' },
    'Houston': { min: 16, max: 30, avg: 23, demand: 'medium' },
    'Miami': { min: 20, max: 38, avg: 29, demand: 'high' },
    'Default': { min: 15, max: 30, avg: 22, demand: 'medium' }
  };

  // Calculate pricing
  const pricingCalculation = useMemo(() => {
    const market = marketData[location.city] || marketData['Default'];
    const sqft = parseInt(propertySize.sqft) || 1000;
    const bedrooms = parseInt(propertySize.bedrooms) || 2;
    const bathrooms = parseInt(propertySize.bathrooms) || 2;
    const floors = parseInt(propertySize.floors) || 1;
    const team = parseInt(teamSize) || 1;
    
    // Base pricing calculation
    let basePrice = 0;
    
    if (serviceType === 'residential') {
      // Residential pricing based on rooms and sqft
      basePrice = (bedrooms * 15) + (bathrooms * 20) + (sqft * 0.08) + (floors * 10);
    } else {
      // Commercial pricing based on sqft
      basePrice = sqft * 0.12;
    }
    
    // Service type multipliers
    const serviceMultipliers = {
      regular: 1.0,
      deep_clean: 1.8,
      move_in: 1.6,
      move_out: 1.7,
      post_construction: 2.2,
      one_time: 1.2
    };
    
    basePrice *= serviceMultipliers[cleaningType];
    
    // Additional services
    const additionalCosts = {
      insideOven: 25,
      insideFridge: 20,
      insideWindows: 30,
      laundry: 15,
      dishes: 10,
      organizing: 40,
      petHairRemoval: 20,
      deepCarpetCleaning: 50
    };
    
    let additionalTotal = 0;
    Object.entries(additionalServices).forEach(([service, selected]) => {
      if (selected) {
        additionalTotal += additionalCosts[service] || 0;
      }
    });
    
    // Team size adjustment
    if (team > 1) {
      basePrice *= (1 + (team - 1) * 0.7); // Each additional person adds 70% of base rate
    }
    
    // Urgency multipliers
    const urgencyMultipliers = {
      standard: 1.0,
      same_day: 1.5,
      next_day: 1.25
    };
    
    basePrice *= urgencyMultipliers[urgency];
    
    const totalPrice = basePrice + additionalTotal;
    
    // Calculate time estimate
    let estimatedHours = 0;
    if (serviceType === 'residential') {
      estimatedHours = (bedrooms * 0.5) + (bathrooms * 0.75) + (sqft / 500) + (floors * 0.25);
    } else {
      estimatedHours = sqft / 400;
    }
    
    estimatedHours *= serviceMultipliers[cleaningType];
    estimatedHours /= team; // Divide by team size
    
    // Add time for additional services
    const additionalTime = Object.entries(additionalServices).reduce((total, [service, selected]) => {
      if (selected) {
        const timeMap = {
          insideOven: 0.5,
          insideFridge: 0.25,
          insideWindows: 1.0,
          laundry: 0.5,
          dishes: 0.25,
          organizing: 1.5,
          petHairRemoval: 0.5,
          deepCarpetCleaning: 1.0
        };
        return total + (timeMap[service] || 0);
      }
      return total;
    }, 0);
    
    estimatedHours += additionalTime;
    
    // Market comparison
    const hourlyRate = totalPrice / estimatedHours;
    const marketPosition = hourlyRate < market.min ? 'low' : 
                          hourlyRate > market.max ? 'high' : 'competitive';
    
    return {
      basePrice,
      additionalTotal,
      totalPrice,
      estimatedHours: Math.max(1, estimatedHours),
      hourlyRate,
      market,
      marketPosition,
      recommendations: generateRecommendations(totalPrice, hourlyRate, market, marketPosition)
    };
  }, [serviceType, cleaningType, propertySize, location, additionalServices, teamSize, urgency]);

  const generateRecommendations = (price, hourlyRate, market, position) => {
    const recommendations = [];
    
    if (position === 'low') {
      recommendations.push({
        type: 'warning',
        title: t('pricing:priceTooLow'),
        message: t('pricing:priceTooLowDesc'),
        action: t('pricing:increasePrice')
      });
    } else if (position === 'high') {
      recommendations.push({
        type: 'info',
        title: t('pricing:priceHigh'),
        message: t('pricing:priceHighDesc'),
        action: t('pricing:justifyValue')
      });
    } else {
      recommendations.push({
        type: 'success',
        title: t('pricing:priceCompetitive'),
        message: t('pricing:priceCompetitiveDesc'),
        action: t('pricing:goodToGo')
      });
    }
    
    if (market.demand === 'high') {
      recommendations.push({
        type: 'success',
        title: t('pricing:highDemand'),
        message: t('pricing:highDemandDesc'),
        action: t('pricing:considerPremium')
      });
    }
    
    return recommendations;
  };

  const handleSaveQuote = () => {
    toast.success(t('pricing:quoteSaved'));
  };

  const handleShareQuote = () => {
    toast.success(t('pricing:quoteShared'));
  };

  const serviceTypeOptions = [
    { value: 'residential', label: t('pricing:residential'), icon: Home },
    { value: 'commercial', label: t('pricing:commercial'), icon: Building2 }
  ];

  const cleaningTypeOptions = [
    { value: 'regular', label: t('pricing:regularCleaning') },
    { value: 'deep_clean', label: t('pricing:deepCleaning') },
    { value: 'move_in', label: t('pricing:moveIn') },
    { value: 'move_out', label: t('pricing:moveOut') },
    { value: 'post_construction', label: t('pricing:postConstruction') },
    { value: 'one_time', label: t('pricing:oneTime') }
  ];

  const additionalServiceOptions = [
    { key: 'insideOven', label: t('pricing:insideOven'), price: 25 },
    { key: 'insideFridge', label: t('pricing:insideFridge'), price: 20 },
    { key: 'insideWindows', label: t('pricing:insideWindows'), price: 30 },
    { key: 'laundry', label: t('pricing:laundry'), price: 15 },
    { key: 'dishes', label: t('pricing:dishes'), price: 10 },
    { key: 'organizing', label: t('pricing:organizing'), price: 40 },
    { key: 'petHairRemoval', label: t('pricing:petHairRemoval'), price: 20 },
    { key: 'deepCarpetCleaning', label: t('pricing:deepCarpetCleaning'), price: 50 }
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-pulse-500" />
            {t('pricing:pricingAssistant')}
          </h1>
          <p className="mt-1 text-gray-600">{t('pricing:calculateCompetitivePricing')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Type Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:serviceType')}</h2>
              <div className="grid grid-cols-2 gap-4">
                {serviceTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setServiceType(option.value as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        serviceType === option.value
                          ? 'border-pulse-500 bg-pulse-50 text-pulse-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cleaning Type */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:cleaningType')}</h2>
              <select
                value={cleaningType}
                onChange={(e) => setCleaningType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
              >
                {cleaningTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:propertyDetails')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:squareFeet')}
                  </label>
                  <input
                    type="number"
                    value={propertySize.sqft}
                    onChange={(e) => setPropertySize(prev => ({ ...prev, sqft: e.target.value }))}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
                
                {serviceType === 'residential' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('pricing:bedrooms')}
                      </label>
                      <select
                        value={propertySize.bedrooms}
                        onChange={(e) => setPropertySize(prev => ({ ...prev, bedrooms: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('pricing:bathrooms')}
                      </label>
                      <select
                        value={propertySize.bathrooms}
                        onChange={(e) => setPropertySize(prev => ({ ...prev, bathrooms: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                      >
                        {[1,1.5,2,2.5,3,3.5,4,5].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:floors')}
                  </label>
                  <select
                    value={propertySize.floors}
                    onChange={(e) => setPropertySize(prev => ({ ...prev, floors: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    {[1,2,3,4].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:location')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:city')}
                  </label>
                  <select
                    value={location.city}
                    onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Houston">Houston</option>
                    <option value="Miami">Miami</option>
                    <option value="Default">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:state')}
                  </label>
                  <input
                    type="text"
                    value={location.state}
                    onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:zipCode')}
                  </label>
                  <input
                    type="text"
                    value={location.zipCode}
                    onChange={(e) => setLocation(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:additionalServices')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalServiceOptions.map((service) => (
                  <label key={service.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={additionalServices[service.key]}
                        onChange={(e) => setAdditionalServices(prev => ({
                          ...prev,
                          [service.key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-pulse-600 focus:ring-pulse-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">{service.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-pulse-600">+{formatCurrency(service.price)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Team & Urgency */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing:teamAndUrgency')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:teamSize')}
                  </label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? t('pricing:person') : t('pricing:people')}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('pricing:urgency')}
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-transparent"
                  >
                    <option value="standard">{t('pricing:standard')}</option>
                    <option value="next_day">{t('pricing:nextDay')} (+25%)</option>
                    <option value="same_day">{t('pricing:sameDay')} (+50%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Results */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-pulse-500" />
                {t('pricing:priceBreakdown')}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('pricing:basePrice')}</span>
                  <span className="font-medium">{formatCurrency(pricingCalculation.basePrice)}</span>
                </div>
                
                {pricingCalculation.additionalTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('pricing:additionalServices')}</span>
                    <span className="font-medium">{formatCurrency(pricingCalculation.additionalTotal)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('pricing:totalPrice')}</span>
                    <span className="text-pulse-600">{formatCurrency(pricingCalculation.totalPrice)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('pricing:estimatedTime')}</span>
                    <span className="font-medium">{pricingCalculation.estimatedHours.toFixed(1)} {t('pricing:hours')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">{t('pricing:hourlyRate')}</span>
                    <span className="font-medium">{formatCurrency(pricingCalculation.hourlyRate)}/hr</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSaveQuote}
                  className="w-full px-4 py-2 bg-pulse-500 text-white rounded-lg hover:bg-pulse-600 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {t('pricing:saveQuote')}
                </button>
                
                <button
                  onClick={handleShareQuote}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  {t('pricing:shareQuote')}
                </button>
              </div>
            </div>

            {/* Market Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pulse-500" />
                {t('pricing:marketAnalysis')}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{t('pricing:marketRange')}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pricingCalculation.market.demand === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {pricingCalculation.market.demand === 'high' ? t('pricing:highDemand') : t('pricing:mediumDemand')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(pricingCalculation.market.min)} - {formatCurrency(pricingCalculation.market.max)}/hr
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('pricing:average')}: {formatCurrency(pricingCalculation.market.avg)}/hr
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  pricingCalculation.marketPosition === 'competitive' ? 'bg-green-50 border border-green-200' :
                  pricingCalculation.marketPosition === 'low' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {pricingCalculation.marketPosition === 'competitive' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : pricingCalculation.marketPosition === 'low' ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-medium text-gray-900">
                      {t('pricing:yourRate')}: {formatCurrency(pricingCalculation.hourlyRate)}/hr
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {pricingCalculation.marketPosition === 'competitive' && t('pricing:competitivePosition')}
                    {pricingCalculation.marketPosition === 'low' && t('pricing:belowMarket')}
                    {pricingCalculation.marketPosition === 'high' && t('pricing:aboveMarket')}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-pulse-500" />
                {t('pricing:aiRecommendations')}
              </h3>
              
              <div className="space-y-3">
                {pricingCalculation.recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    rec.type === 'success' ? 'bg-green-50 border-green-200' :
                    rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.message}</p>
                    <span className="text-sm font-medium text-pulse-600">{rec.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PricingAssistant; 