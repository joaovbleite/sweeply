import React from "react";

const BusinessStats = () => {
  return <section id="business-stats" className="bg-white py-0">
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="pulse-chip">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">05</span>
              <span>Impact</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-display font-bold mb-4 text-left">Proven business results</h2>
          <p className="text-xl text-gray-700 mb-10 text-left">
            See how Sweeply transforms cleaning businesses across the country
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">87%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Faster Invoicing</div>
              <div className="text-gray-600">Average time saved on billing and payment tracking</div>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">3.2x</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Business Growth</div>
              <div className="text-gray-600">Average revenue increase within 6 months</div>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">15hrs</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Weekly Time Savings</div>
              <div className="text-gray-600">Less admin work, more time for cleaning and clients</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default BusinessStats;