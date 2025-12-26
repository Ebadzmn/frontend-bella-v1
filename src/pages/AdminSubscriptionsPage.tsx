import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { toast } from 'react-hot-toast';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  vehicleType?: 'CAR' | 'TAXI' | 'VAN';
  tier?: 'BASE' | 'STANDARD' | 'PREMIUM';
  inAndOutQuota?: number;
  outsideOnlyQuota?: number;
  inAndOutPayout?: number;
  outsideOnlyPayout?: number;
  active: boolean;
  features?: string[];
}

interface Invoice {
  id: number;
  customer: string;
  amount: number;
  gateway: string;
  status: string;
  date: string;
  transactionId: string;
}

const AdminSubscriptionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'logs'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    vehicleType: 'CAR' as 'CAR' | 'TAXI' | 'VAN',
    tier: 'BASE' as 'BASE' | 'STANDARD' | 'PREMIUM',
    inAndOutQuota: 0,
    outsideOnlyQuota: 0,
    inAndOutPayout: 0,
    outsideOnlyPayout: 0,
    features: '',
    active: true,
  });

  useEffect(() => {
    if (activeTab === 'plans') {
      fetchPlans();
    } else {
      fetchInvoices();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('admin/plans'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch plans');

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setPlans([]);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('admin/invoices'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
      toast.error('Failed to load payment logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    try {
      const url = editingPlan
        ? getApiUrl(`admin/plans/${editingPlan.id}`)
        : getApiUrl('admin/plans');

      const response = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: planForm.name,
          price: planForm.price,
          duration: 30,
          vehicleType: planForm.vehicleType,
          tier: planForm.tier,
          inAndOutQuota: planForm.inAndOutQuota,
          outsideOnlyQuota: planForm.outsideOnlyQuota,
          inAndOutPayout: planForm.inAndOutPayout,
          outsideOnlyPayout: planForm.outsideOnlyPayout,
          description: planForm.features,
          active: planForm.active,
        }),
      });

      if (!response.ok) throw new Error('Failed to save plan');

      toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
      setShowPlanModal(false);
      setPlanForm({ name: '', price: 0, vehicleType: 'CAR', tier: 'BASE', inAndOutQuota: 0, outsideOnlyQuota: 0, inAndOutPayout: 0, outsideOnlyPayout: 0, features: '', active: true });
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(getApiUrl(`admin/plans/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete plan');
      }

      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast.error(error.message || 'Failed to delete plan');
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price,
      vehicleType: plan.vehicleType || 'CAR',
      tier: plan.tier || 'BASE',
      inAndOutQuota: plan.inAndOutQuota || 0,
      outsideOnlyQuota: plan.outsideOnlyQuota || 0,
      inAndOutPayout: plan.inAndOutPayout || 0,
      outsideOnlyPayout: plan.outsideOnlyPayout || 0,
      features: plan.description || '',
      active: plan.active,
    });
    setShowPlanModal(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      success: { bg: 'bg-green-500', text: 'success' },
      failed: { bg: 'bg-red-500', text: 'failed' },
      pending: { bg: 'bg-yellow-500', text: 'pending' },
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;

    return (
      <span className={`${statusConfig.bg} text-white px-3 py-1 rounded-full text-xs font-medium`}>
        {statusConfig.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-3 px-4 font-medium ${activeTab === 'plans'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 font-medium ${activeTab === 'logs'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Payment Logs
          </button>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Plans
                <span className="text-sm font-normal text-gray-500 ml-2">
                  Create, edit, or delete subscription tiers
                </span>
              </h2>
              <button
                onClick={() => {
                  setEditingPlan(null);
                  setPlanForm({ name: '', price: 0, vehicleType: 'CAR', tier: 'BASE', inAndOutQuota: 0, outsideOnlyQuota: 0, inAndOutPayout: 0, outsideOnlyPayout: 0, features: '', active: true });
                  setShowPlanModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">£{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <div className="mb-6">
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-gray-500">{plan.vehicleType || 'N/A'} - {plan.tier || 'N/A'}</p>
                      <p className="text-sm text-gray-600">In & Out: {plan.inAndOutQuota || 0} washes (£{plan.inAndOutPayout || 0}/wash)</p>
                      {plan.outsideOnlyQuota && plan.outsideOnlyQuota > 0 && (
                        <p className="text-sm text-gray-600">Outside Only: {plan.outsideOnlyQuota} washes (£{plan.outsideOnlyPayout || 0}/wash)</p>
                      )}
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-700">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Payment Gateway Logs</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${invoice.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{invoice.gateway}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{invoice.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-600">{invoice.transactionId}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {invoices.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No payment logs found</p>
              </div>
            )}
          </div>
        )}

        {/* Plan Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Premium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (£)</label>
                  <input
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    <select
                      value={planForm.vehicleType}
                      onChange={(e) => setPlanForm({ ...planForm, vehicleType: e.target.value as 'CAR' | 'TAXI' | 'VAN' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CAR">Car</option>
                      <option value="TAXI">Taxi</option>
                      <option value="VAN">Van</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                    <select
                      value={planForm.tier}
                      onChange={(e) => setPlanForm({ ...planForm, tier: e.target.value as 'BASE' | 'STANDARD' | 'PREMIUM' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BASE">Base</option>
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">In & Out Quota</label>
                    <input
                      type="number"
                      value={planForm.inAndOutQuota}
                      onChange={(e) => setPlanForm({ ...planForm, inAndOutQuota: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">In & Out Payout (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={planForm.inAndOutPayout}
                      onChange={(e) => setPlanForm({ ...planForm, inAndOutPayout: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outside Only Quota</label>
                    <input
                      type="number"
                      value={planForm.outsideOnlyQuota}
                      onChange={(e) => setPlanForm({ ...planForm, outsideOnlyQuota: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outside Only Payout (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={planForm.outsideOnlyPayout}
                      onChange={(e) => setPlanForm({ ...planForm, outsideOnlyPayout: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={planForm.features}
                    onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Plan description..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={planForm.active}
                    onChange={(e) => setPlanForm({ ...planForm, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                    Active (visible to users)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setEditingPlan(null);
                    setPlanForm({ name: '', price: 0, vehicleType: 'CAR', tier: 'BASE', inAndOutQuota: 0, outsideOnlyQuota: 0, inAndOutPayout: 0, outsideOnlyPayout: 0, features: '', active: true });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
