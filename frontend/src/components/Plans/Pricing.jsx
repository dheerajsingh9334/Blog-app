import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPlansAPI } from "../../APIServices/plans/plans";

const Pricing = () => {
  const navigate = useNavigate();
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["pricing-lists"],
    queryFn: fetchPlansAPI,
  });

  const handlePlanSelection = (plan) => {
    const identifier = plan?._id || plan?.tier || plan?.planName;
    if (!identifier) {
      console.error("Plan identifier not found:", plan);
      return;
    }
    if (plan.tier === "free" || plan.planName === "Free") {
      navigate("/free-subscription");
    } else {
      navigate(`/checkout/${identifier}`, { state: { planCandidate: plan } });
    }
  };

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plans...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">Error loading plans: {error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Get plans by tier with fallback
  const freePlan = data?.plans?.find((plan) => plan.tier === "free" || plan.planName === "Free") || {
    _id: "free",
    planName: "Free",
    tier: "free",
    price: 0,
    postLimit: 10,
    features: ["Up to 10 posts", "Basic analytics", "Community access", "Standard support"]
  };
  
  const premiumPlan = data?.plans?.find((plan) => plan.tier === "premium" || plan.planName === "Premium") || {
    _id: "premium",
    planName: "Premium", 
    tier: "premium",
    price: 29,
    postLimit: null,
    features: ["Unlimited posts", "Advanced analytics", "SEO tools", "Content calendar", "Priority support"]
  };
  
  const proPlan = data?.plans?.find((plan) => plan.tier === "pro" || plan.planName === "Pro") || {
    _id: "pro",
    planName: "Pro",
    tier: "pro", 
    price: 99,
    postLimit: null,
    features: ["Everything in Premium", "Team collaboration", "API access", "White-label solution", "Dedicated support"]
  };

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-6xl font-bold font-serif text-gray-900 dark:text-white mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start for free, no credit card required. Upgrade when you're ready to unlock more features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 relative">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {freePlan?.planName || "Free"}
              </h3>
              {freePlan?.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">{freePlan.description}</p>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">/month</span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  {freePlan?.postLimit ? `Limit: ${freePlan.postLimit} posts` : "Limited posts"}
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection(freePlan)}
                className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
              >
                Get Started Free
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">What's included:</h4>
              <ul className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {(freePlan?.features || [
                  "Up to 10 posts",
                  "Basic analytics",
                  "Community access",
                  "Standard support",
                  "Basic templates",
                  "Public profile",
                  "Follow other users",
                  "Comment on posts",
                  "Like and share posts",
                  "Email notifications",
                  "Mobile responsive",
                  "Basic SEO tools",
                  "Social media sharing",
                  "Basic content editor",
                  "Image uploads (up to 5MB)",
                  "Basic search functionality",
                  "Community engagement",
                  "Basic reporting",
                  "Email support",
                  "Mobile app access",
                  "Basic content scheduling",
                  "Draft saving",
                  "Basic content optimization",
                  "Social media integration",
                  "Newsletter signup",
                  "Basic user analytics",
                  "Content backup",
                  "Basic security features",
                  "Multi-language support (basic)",
                  "Basic API access",
                  "Basic content calendar",
                  "Basic user management",
                  "Basic content moderation",
                  "Basic performance insights",
                  "Basic collaboration tools",
                  "Basic automation features",
                  "Basic A/B testing",
                  "Basic custom workflows",
                  "Basic data export",
                  "Basic custom reporting",
                  "Basic monetization tools",
                  "Basic webhook integrations",
                  "Basic content optimization",
                  "Basic multi-site management"
                ]).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 relative transform scale-105">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                MOST POPULAR
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {premiumPlan?.planName || "Premium"}
              </h3>
              {premiumPlan?.description && (
                <p className="text-green-100 mb-4 sm:mb-6 text-sm sm:text-base">{premiumPlan.description}</p>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-white">${premiumPlan?.price || "29"}</span>
                <span className="text-green-100 text-sm sm:text-base">/month</span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-white/20 text-xs sm:text-sm text-white mr-2">
                  Unlimited posts
                </span>
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-white text-green-600 text-xs font-semibold">
                  PREMIUM
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection(premiumPlan)}
                disabled={!premiumPlan?._id}
                className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-green-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {premiumPlan?._id ? "Start Premium" : "Loading..."}
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">What's included:</h4>
              <ul className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {(premiumPlan?.features || [
                  "Unlimited posts",
                  "Priority support",
                  "Advanced analytics",
                  "Custom branding",
                  "Email notifications",
                  "Ad-free experience",
                  "Priority listing",
                  "Advanced SEO tools",
                  "Custom domain",
                  "Scheduled posts",
                  "Draft saving",
                  "Rich text editor",
                  "Image optimization",
                  "Social media integration",
                  "Newsletter integration",
                  "Comment moderation",
                  "User engagement insights",
                  "Content calendar",
                  "Backup and restore",
                  "Priority customer support",
                  "Advanced content scheduling",
                  "A/B testing",
                  "Advanced user management",
                  "Custom workflows",
                  "Advanced security features",
                  "Data export and import",
                  "Custom reporting",
                  "Advanced monetization tools",
                  "Priority feature requests",
                  "Dedicated account manager",
                  "Custom training sessions",
                  "Advanced automation",
                  "Enterprise-grade security",
                  "99.9% uptime guarantee",
                  "Custom branding removal",
                  "Advanced API rate limits",
                  "Webhook integrations",
                  "Advanced content optimization",
                  "Multi-site management",
                  "Advanced analytics dashboard",
                  "Custom themes and templates",
                  "Multi-language support",
                  "Team collaboration",
                  "Revenue sharing",
                  "Advanced content scheduling",
                  "Advanced user management",
                  "Custom workflows",
                  "Advanced security features",
                  "Data export and import",
                  "Custom reporting",
                  "Advanced monetization tools",
                  "Priority feature requests",
                  "Dedicated account manager",
                  "Custom training sessions",
                  "Advanced automation",
                  "Enterprise-grade security",
                  "99.9% uptime guarantee",
                  "Custom branding removal",
                  "Advanced API rate limits",
                  "Webhook integrations",
                  "Advanced content optimization",
                  "Multi-site management"
                ]).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-100 text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                PRO
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {proPlan?.planName || "Pro"}
              </h3>
              {proPlan?.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">{proPlan.description}</p>
              )}
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">${proPlan?.price || "99"}</span>
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">/month</span>
              </div>
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:indigo-300 text-xs sm:text-sm">
                  Unlimited everything
                </span>
              </div>
              <button
                onClick={() => handlePlanSelection(proPlan)}
                disabled={!proPlan?._id}
                className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {proPlan?._id ? "Start Pro" : "Loading..."}
              </button>
            </div>
            <div className="mt-6 sm:mt-8">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">What's included:</h4>
              <ul className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {(proPlan?.features || [
                  "Everything in Premium",
                  "API access",
                  "White-label solution",
                  "Dedicated support",
                  "Custom integrations",
                  "Team collaboration",
                  "Advanced SEO tools",
                  "Revenue sharing",
                  "Advanced analytics dashboard",
                  "Custom themes and templates",
                  "Multi-language support",
                  "Advanced content scheduling",
                  "A/B testing",
                  "Advanced user management",
                  "Custom workflows",
                  "Advanced security features",
                  "Data export and import",
                  "Custom reporting",
                  "Advanced monetization tools",
                  "Priority feature requests",
                  "Dedicated account manager",
                  "Custom training sessions",
                  "Advanced automation",
                  "Enterprise-grade security",
                  "99.9% uptime guarantee",
                  "Custom branding removal",
                  "Advanced API rate limits",
                  "Webhook integrations",
                  "Advanced content optimization",
                  "Multi-site management",
                  "Advanced analytics dashboard",
                  "Custom themes and templates",
                  "Multi-language support",
                  "Advanced content scheduling",
                  "A/B testing",
                  "Advanced user management",
                  "Custom workflows",
                  "Advanced security features",
                  "Data export and import",
                  "Custom reporting",
                  "Advanced monetization tools",
                  "Priority feature requests",
                  "Dedicated account manager",
                  "Custom training sessions",
                  "Advanced automation",
                  "Enterprise-grade security",
                  "99.9% uptime guarantee",
                  "Custom branding removal",
                  "Advanced API rate limits",
                  "Webhook integrations",
                  "Advanced content optimization",
                  "Multi-site management"
                ]).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What happens to my posts if I downgrade?</h3>
              <p className="text-gray-600 dark:text-gray-400">Your existing posts remain accessible. You'll only be limited on creating new posts based on your plan.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
