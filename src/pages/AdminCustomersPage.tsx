import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Download, Eye, Edit2, Trash2, X, CheckCircle, Ban, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { toast } from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    inAndOutWashesUsed: number;
    outsideOnlyWashesUsed: number;
    inAndOutQuota: number;
    outsideOnlyQuota: number;
  } | null;
}

interface DetailedCustomer extends Customer {
  paymentMethods: any[];
  verifications: any[];
  supportTickets: any[];
}

const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);

  // Modal States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailedCustomer, setDetailedCustomer] = useState<DetailedCustomer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (planFilter !== 'all') params.append('plan', planFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(getApiUrl(`admin/customers?${params}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch customers');

      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [planFilter, statusFilter, searchQuery]); // Re-fetch when filters change

  const fetchCustomerDetails = async (id: number) => {
    try {
      setModalLoading(true);
      const response = await fetch(getApiUrl(`admin/customers/${id}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch details');

      const data = await response.json();
      setDetailedCustomer(data.customer);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to load customer details');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(getApiUrl(`admin/customers/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success(`Customer ${newStatus.toLowerCase()} successfully`);
      fetchCustomers(); // Refresh list
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await fetch(getApiUrl(`admin/customers/${selectedCustomer.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      toast.success('Customer deleted successfully');
      fetchCustomers();
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(getApiUrl('admin/customers/export'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export customers');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast.error('Failed to export customers');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800' },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800' },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Components for Modals
  const EditCustomerModal = () => {
    const [formData, setFormData] = useState({
      name: selectedCustomer?.name || '',
      email: selectedCustomer?.email || '',
      phone: selectedCustomer?.phone || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedCustomer) return;

      try {
        const response = await fetch(getApiUrl(`admin/customers/${selectedCustomer.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update customer');

        toast.success('Customer updated successfully');
        fetchCustomers();
        setShowEditModal(false);
      } catch (error) {
        console.error('Error updating customer:', error);
        toast.error('Failed to update customer');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Customer</h3>
            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CustomerDetailsModal = () => {
    if (!detailedCustomer && modalLoading) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        </div>
      );
    }

    if (!detailedCustomer) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
            <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Name</span>
                  <span className="font-medium">{detailedCustomer.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email</span>
                  <span className="font-medium">{detailedCustomer.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Phone</span>
                  <span className="font-medium">{detailedCustomer.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  {getStatusBadge(detailedCustomer.status)}
                </div>
                <div>
                  <span className="text-gray-500 block">Joined</span>
                  <span className="font-medium">{formatDate(detailedCustomer.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Subscription</h4>
              {detailedCustomer.subscription ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium text-orange-600">{detailedCustomer.subscription.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">{detailedCustomer.subscription.status}</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-gray-500 mb-1">Usage</div>
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                      <div>
                        <span className="text-xs text-gray-500">In & Out</span>
                        <div className="font-medium">{detailedCustomer.subscription.inAndOutWashesUsed} / {detailedCustomer.subscription.inAndOutQuota || '∞'}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Outside Only</span>
                        <div className="font-medium">{detailedCustomer.subscription.outsideOnlyWashesUsed} / {detailedCustomer.subscription.outsideOnlyQuota || '∞'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active subscription</p>
              )}
            </div>

            {/* Recent Verifications/Washes */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Washes</h4>
              {detailedCustomer.verifications && detailedCustomer.verifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Location</th>
                        <th className="px-3 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {detailedCustomer.verifications.map((v: any) => (
                        <tr key={v.id}>
                          <td className="px-3 py-2">{formatDate(v.createdAt)}</td>
                          <td className="px-3 py-2">Partner ID {v.partnerId}</td>
                          <td className="px-3 py-2">{v.washType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No wash history</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-visible">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Customers ({customers.length})</h3>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                      <div className="text-xs text-gray-500">{customer.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.subscription?.plan || 'No Plan'}</div>
                      {customer.subscription && (
                        <span className="text-xs text-gray-500">{customer.subscription.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{formatDate(customer.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionsMenu(showActionsMenu === customer.id ? null : customer.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {showActionsMenu === customer.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                            <div className="py-1">
                              <button
                                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  fetchCustomerDetails(customer.id);
                                  setShowDetailsModal(true);
                                  setShowActionsMenu(null);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowEditModal(true);
                                  setShowActionsMenu(null);
                                }}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Customer
                              </button>

                              {customer.status === 'ACTIVE' ? (
                                <button
                                  className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                                  onClick={() => handleUpdateStatus(customer.id, 'SUSPENDED')}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend Account
                                </button>
                              ) : (
                                <button
                                  className="flex items-center w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50"
                                  onClick={() => handleUpdateStatus(customer.id, 'ACTIVE')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate Account
                                </button>
                              )}

                              <div className="border-t border-gray-100 my-1"></div>
                              <button
                                className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowDeleteModal(true);
                                  setShowActionsMenu(null);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Customer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailsModal && <CustomerDetailsModal />}
      {showEditModal && <EditCustomerModal />}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Delete Customer?</h3>
            <p className="text-center text-gray-500 mb-6">
              Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
