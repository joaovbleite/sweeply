import React, { useState } from "react";
import { Check, X, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for solo cleaners getting started",
      features: [
        "Up to 10 clients",
        "Basic scheduling",
        "Client contact management",
        "Mobile app access",
        "Email support"
      ],
      limitations: [
        "No invoicing",
        "No team features",
        "No AI assistant",
        "No payment tracking"
      ],
      cta: "Start Free",
      popular: false,
      gradient: "from-gray-50 to-gray-100"
    },
    {
      name: "Standard",
      price: { monthly: 29, annual: 290 },
      description: "For growing cleaning businesses",
      features: [
        "Unlimited clients",
        "Smart scheduling with recurring jobs",
        "Professional invoicing",
        "Payment tracking & reminders",
        "Team member management (up to 5)",
        "Client history & notes",
        "Email & SMS notifications",
        "Basic reporting"
      ],
      limitations: [
        "No AI assistant",
        "No custom branding",
        "Standard support"
      ],
      cta: "Start 14-Day Trial",
      popular: true,
      gradient: "from-blue-50 to-blue-100"
    },
    {
      name: "Pro",
      price: { monthly: 59, annual: 590 },
      description: "For professional cleaning operations",
      features: [
        "Everything in Standard",
        "AI Assistant (pricing, translations)",
        "Unlimited team members",
        "Custom branding & invoices",
        "Bilingual interface (EN/PT)",
        "Advanced reporting & analytics",
        "Quote builder",
        "Priority support",
        "Calendar integrations"
      ],
      limitations: [],
      cta: "Start 14-Day Trial",
      popular: false,
      gradient: "from-orange-50 to-orange-100"
    },
    {
      name: "Enterprise",
      price: { monthly: "Custom", annual: "Custom" },
      description: "For large cleaning companies",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "White-label solutions",
        "Dedicated account manager",
        "Custom training",
        "SLA guarantees",
        "Advanced security",
        "Multiple locations support"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-green-50 to-green-100"
    }
  ];

  const faqItems = [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing differences."
    },
    {
      question: "Is there a free trial?",
      answer: "We offer a 14-day free trial for Standard and Pro plans. No credit card required to start."
    },
    {
      question: "Do you support Portuguese language?",
      answer: "Yes! Pro and Enterprise plans include full bilingual support with seamless switching between English and Portuguese."
    },
    {
      question: "Can I use Sweeply on my phone?",
      answer: "Absolutely! Sweeply is mobile-first and works perfectly on smartphones and tablets for on-the-go management."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal for your convenience."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use enterprise-grade security with SSL encryption, regular backups, and comply with industry security standards."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="section-container text-center">
          <div className="pulse-chip mx-auto mb-6">
            <span>Pricing</span>
          </div>
          
          <h1 className="section-title mb-6">
            Simple, transparent pricing for <br className="hidden sm:block" />
            every cleaning business
          </h1>
          
          <p className="section-subtitle mx-auto mb-8">
            Start free and scale as you grow. No hidden fees, no long-term contracts.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`mr-3 ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pulse-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-pulse-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Save 2 months
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden shadow-elegant transition-all duration-300 hover:shadow-elegant-hover ${
                  plan.popular ? 'ring-2 ring-pulse-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center space-x-1 bg-pulse-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                {/* Card Header */}
                <div className={`p-6 bg-gradient-to-br ${plan.gradient} border-b border-gray-200`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline">
                    {typeof plan.price.monthly === 'number' ? (
                      <>
                        <span className="text-3xl font-bold text-gray-900">
                          ${isAnnual && typeof plan.price.annual === 'number' ? (plan.price.annual / 12).toFixed(0) : plan.price.monthly}
                        </span>
                        <span className="text-gray-500 ml-1">/month</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">{plan.price.monthly}</span>
                    )}
                  </div>
                  
                  {isAnnual && typeof plan.price.annual === 'number' && plan.price.annual > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${plan.price.annual}/year (billed annually)
                    </p>
                  )}
                </div>
                
                {/* Card Content */}
                <div className="p-6 bg-white">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start">
                        <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-3 px-4 rounded-full font-medium transition-all duration-300 ${
                      plan.popular
                        ? 'bg-pulse-500 hover:bg-pulse-600 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="pulse-chip mx-auto mb-4">
              <span>Compare Plans</span>
            </div>
            <h2 className="section-title mb-4">
              Everything you need to succeed
            </h2>
            <p className="section-subtitle mx-auto">
              See exactly what's included in each plan
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-elegant overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Features</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Standard</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: "Client Management", free: "Up to 10", standard: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Smart Scheduling", free: false, standard: true, pro: true, enterprise: true },
                  { feature: "Professional Invoicing", free: false, standard: true, pro: true, enterprise: true },
                  { feature: "Team Management", free: false, standard: "Up to 5", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "AI Assistant", free: false, standard: false, pro: true, enterprise: true },
                  { feature: "Bilingual Support", free: false, standard: false, pro: true, enterprise: true },
                  { feature: "Custom Branding", free: false, standard: false, pro: true, enterprise: true },
                  { feature: "API Access", free: false, standard: false, pro: false, enterprise: true },
                  { feature: "Priority Support", free: false, standard: false, pro: true, enterprise: true }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {typeof row.free === 'boolean' ? (
                        row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : row.free}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {typeof row.standard === 'boolean' ? (
                        row.standard ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : row.standard}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : row.pro}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="section-container">
          <div className="text-center mb-12">
            <div className="pulse-chip mx-auto mb-4">
              <span>FAQ</span>
            </div>
            <h2 className="section-title mb-4">
              Frequently asked questions
            </h2>
            <p className="section-subtitle mx-auto">
              Everything you need to know about Sweeply pricing
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="mb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pulse-500"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
                    <span className="text-2xl text-gray-400">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </div>
                  {openFaq === index && (
                    <p className="mt-4 text-gray-600 leading-relaxed">{item.answer}</p>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pulse-500 to-pulse-600">
        <div className="section-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your cleaning business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of cleaning professionals who trust Sweeply to manage their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-pulse-500 font-medium py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white font-medium py-3 px-8 rounded-full hover:bg-white/10 transition-colors duration-300">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing; 