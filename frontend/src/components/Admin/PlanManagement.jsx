import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllPlansAPI, 
  createPlanAPI, 
  updatePlanAPI, 
  deletePlanAPI,
  getAllUsersAPI,
  assignPlanToUserAPI
} from '../../APIServices/admin/adminAPI';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const PlanManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    tier: 'free',
    price: 0,
    postLimit: 10,
    features: [''],
    isActive: true,
    checkoutEnabled: true,
    stripePriceId: '',
    trialDays: 0
  });

  const [showUserPlanModal, setShowUserPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPlan, setSelectedUserPlan] = useState('');

  const queryClient = useQueryClient();

  const { data: plansData, isLoading, error } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: getAllPlansAPI,
    staleTime: 30000, // 30 seconds
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-for-plans'],
    queryFn: () => getAllUsersAPI({ limit: 100 }),
    staleTime: 30000, // 30 seconds
  });

  const assignPlanMutation = useMutation({
    mutationFn: ({ userId, planId }) => assignPlanToUserAPI(userId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users-for-plans']);
      setShowUserPlanModal(false);
      setSelectedUser(null);
      setSelectedUserPlan('');
    },
    onError: (error) => {
      console.error('Error assigning plan:', error);
      alert(`Failed to assign plan: ${error.message || 'Unknown error'}`);
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => createPlanAPI(planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-plans']);
      setShowCreateModal(false);
      setFormData({
        planName: '',
        description: '',
        tier: 'free',
        price: 0,
        postLimit: 10,
        features: [''],
        isActive: true
      });
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      alert(`Failed to create plan: ${error.message || 'Unknown error'}`);
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, planData }) => updatePlanAPI(planId, planData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-plans']);
      setShowEditModal(false);
      setSelectedPlan(null);
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      alert(`Failed to update plan: ${error.message || 'Unknown error'}`);
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => deletePlanAPI(planId),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-plans']);
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      alert(`Failed to delete plan: ${error.message || 'Unknown error'}`);
    }
  });

  const handleCreatePlan = () => {
    const planData = {
      ...formData,
      features: formData.features.filter(feature => feature.trim() !== '')
    };
    createPlanMutation.mutate(planData);
  };

  const handleUpdatePlan = () => {
    if (selectedPlan) {
      const planData = {
        ...formData,
        features: formData.features.filter(feature => feature.trim() !== '')
      };
      updatePlanMutation.mutate({ planId: selectedPlan._id, planData });
    }
  };

  const handleDeletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      deletePlanMutation.mutate(planId);
    }
  };

  const handleAssignPlan = () => {
    if (selectedUser) {
      // If no plan is selected, it means removing the plan (setting to free)
      const planId = selectedUserPlan || null;
      assignPlanMutation.mutate({ userId: selectedUser._id, planId });
    }
  };

  const handleGlobalPriceUpdate = (planId) => {
    // Get the new price from the input field
    const priceInput = document.querySelector(`input[data-plan-id="${planId}"]`);
    if (priceInput && priceInput.value) {
      const newPrice = parseFloat(priceInput.value);
      if (newPrice >= 0) {
        updatePlanMutation.mutate({ 
          planId, 
          planData: { price: newPrice } 
        });
      } else {
        alert('Please enter a valid price (0 or greater)');
      }
    } else {
      alert('Please enter a new price');
    }
  };

  const openUserPlanModal = (user) => {
    setSelectedUser(user);
    setSelectedUserPlan(user.plan?._id || '');
    setShowUserPlanModal(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      planName: plan.planName,
      description: plan.description || '',
      tier: plan.tier,
      price: plan.price,
      postLimit: plan.postLimit || 10,
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      isActive: plan.isActive
    });
    setShowEditModal(true);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-green-100 text-green-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'free': return 'FREE';
      case 'premium': return 'PREMIUM';
      case 'pro': return 'PRO';
      default: return tier.toUpperCase();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Error loading plans</p>
          <p className="text-sm">{error.message || 'Failed to load plans. Please try again.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Management</h2>
          <p className="text-gray-600">Manage subscription plans and pricing</p>
          <div className="mt-2 flex space-x-2">
            <a href="/plans" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">View Public Plans</a>
            <span className="text-gray-400">•</span>
            <a href="/pricing" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm">Pricing Page</a>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      {plansData?.plans && plansData.plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plansData.plans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow relative">
              {/* Plan Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getTierColor(plan.tier)}`}>
                  {getTierBadge(plan.tier)}
                </span>
              </div>

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.planName}</h3>
                {plan.description && (
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                )}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                    {plan.postLimit ? `Limit: ${plan.postLimit} posts` : "Unlimited posts"}
                  </span>
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Features:</h4>
                  <ul className="space-y-3 max-h-64 overflow-y-auto">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 text-blue-600 hover:text-blue-900 border border-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <PencilIcon className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                {plan.tier !== 'free' && (
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="flex-1 text-red-600 hover:text-red-900 border border-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
          <p className="text-gray-600 mb-4">No subscription plans have been created yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Plan
          </button>
        </div>
      )}

      {/* User Plan Management Section */}
      <div className="mt-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">User Plan Assignment & Management</h3>
          <p className="text-gray-600">Assign, change, or remove subscription plans for users. Changes take effect immediately.</p>
          
          {/* Bulk Plan Change */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Bulk Plan Change</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Select Plan</label>
                <select
                  value={selectedUserPlan}
                  onChange={(e) => setSelectedUserPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Free Plan (Default)</option>
                  {plansData?.plans?.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} - ${plan.price}/month
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">Filter Users</label>
                <select className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">All Users</option>
                  <option value="free">Free Plan Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="pro">Pro Users</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Bulk plan change feature coming soon!')}
                >
                  Apply to Selected Users
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              ⚠️ This will change plans for multiple users at once. Use with caution.
            </p>
          </div>
        </div>
        
        {usersLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData?.users?.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.plan ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan ? user.plan.planName : 'Free Plan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.plan ? (
                          <div className="text-sm text-gray-600">
                            <div>${user.plan.price}/month</div>
                            <div>{user.plan.postLimit ? `${user.plan.postLimit} posts` : 'Unlimited'}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Free tier - 10 posts</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openUserPlanModal(user)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Change Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Global Plan Price Management Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Global Plan Price Management</h3>
          <p className="text-gray-600">Edit plan prices globally and manage user plan assignments</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {plansData?.plans?.map((plan) => (
            <div key={plan._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">{plan.planName}</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                  <div className="text-lg font-bold text-green-600">${plan.price}/month</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={plan.price}
                    data-plan-id={plan._id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new price"
                  />
                </div>
                <button 
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  onClick={() => handleGlobalPriceUpdate(plan._id)}
                >
                  Update Price Globally
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Plan Management Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Checkout & Payment Settings</h3>
          <p className="text-gray-600">Manage checkout flow and payment configurations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stripe Configuration */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Stripe Integration</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Public Key</label>
                <input
                  type="text"
                  placeholder="pk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                <input
                  type="password"
                  placeholder="sk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  readOnly
                />
              </div>
              <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
                Update Stripe Keys
              </button>
            </div>
          </div>

          {/* Checkout Flow Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Checkout Flow</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Enable Free Plan Signup</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Auto-assign Free Plan</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Payment Analytics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Analytics</h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$2,450</div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Active Subscriptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <div className="text-sm text-gray-600">Payment Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Plan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Post Limit</label>
                  <input
                    type="number"
                    value={formData.postLimit}
                    onChange={(e) => setFormData({...formData, postLimit: parseInt(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Feature description"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
                
                {/* Checkout Settings */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Checkout Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Enable Checkout</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.checkoutEnabled}
                          onChange={(e) => setFormData({...formData, checkoutEnabled: e.target.checked})}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {formData.checkoutEnabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Stripe Price ID</label>
                          <input
                            type="text"
                            value={formData.stripePriceId}
                            onChange={(e) => setFormData({...formData, stripePriceId: e.target.value})}
                            placeholder="price_..."
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Trial Days</label>
                          <input
                            type="number"
                            value={formData.trialDays}
                            onChange={(e) => setFormData({...formData, trialDays: parseInt(e.target.value)})}
                            min="0"
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={!formData.planName.trim() || createPlanMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createPlanMutation.isLoading ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {showEditModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Plan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                  <input
                    type="text"
                    value={formData.planName}
                    onChange={(e) => setFormData({...formData, planName: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="2"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Post Limit</label>
                  <input
                    type="number"
                    value={formData.postLimit}
                    onChange={(e) => setFormData({...formData, postLimit: parseInt(e.target.value)})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Feature description"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePlan}
                  disabled={!formData.planName.trim() || updatePlanMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatePlanMutation.isLoading ? 'Updating...' : 'Update Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Plan Assignment Modal */}
      {showUserPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change User Plan</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Changing plan for: <span className="font-medium">{selectedUser.username}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Current plan: <span className="font-medium">{selectedUser.plan?.planName || 'Free Plan'}</span>
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select New Plan</label>
                  <select
                    value={selectedUserPlan}
                    onChange={(e) => setSelectedUserPlan(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Free Plan (Default)</option>
                    {plansData?.plans?.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.planName} - ${plan.price}/month
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserPlanModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPlan}
                  disabled={assignPlanMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {assignPlanMutation.isLoading ? 'Updating...' : 'Update Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagement;




