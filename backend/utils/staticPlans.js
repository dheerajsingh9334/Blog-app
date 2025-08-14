// Static plans definition (immutable)
// _id values are stable string identifiers equal to the tier for convenience

const STATIC_PLANS = [
  {
    _id: 'free',
    planName: 'Free',
    description: 'Perfect for getting started. Basic features to help you begin your journey.',
    features: [
      'Up to 10 posts',
      'Basic analytics',
      'Community access',
      'Standard support',
    ],
    price: 0,
    postLimit: 10,
    tier: 'free',
    isActive: true,
  },
  {
    _id: 'premium',
    planName: 'Premium',
    description: 'For serious creators who want to grow their audience and monetize their content.',
    features: [
      'Unlimited posts',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
    price: 29,
    postLimit: null,
    tier: 'premium',
    isActive: true,
  },
  {
    _id: 'pro',
    planName: 'Pro',
    description: 'For businesses and power users who need advanced features and dedicated support.',
    features: [
      'Everything in Premium',
      'API access',
      'White-label solution',
      'Dedicated support',
    ],
    price: 99,
    postLimit: null,
    tier: 'pro',
    isActive: true,
  },
];

function getStaticPlans() {
  return STATIC_PLANS;
}

function resolveStaticPlanByIdOrName(identifier) {
  if (!identifier) return null;
  const id = String(identifier).toLowerCase();
  return STATIC_PLANS.find(
    (p) =>
      p._id === id ||
      p.tier === id ||
      (p.planName && p.planName.toLowerCase() === id)
  ) || null;
}

module.exports = { getStaticPlans, resolveStaticPlanByIdOrName };



